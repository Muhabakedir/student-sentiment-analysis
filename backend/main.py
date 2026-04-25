"""
main.py — UniFeedback API
─────────────────────────
Public endpoints (no auth):
  POST /api/feedback          student submits anonymously → BERT assigns sentiment
  POST /api/auth/login        admin login → returns JWT token

Protected endpoints (require Bearer token):
  GET  /api/feedback          list all feedback (filterable + date range)
  GET  /api/feedback/export   download as CSV
  GET  /api/stats             overall sentiment counts
  GET  /api/stats/services    per-service breakdown
  GET  /api/stats/themes      per-theme breakdown
  POST /api/predict           quick one-off prediction
  GET  /api/status            health check
"""

import os
import csv
import io
from datetime import datetime, timedelta, timezone as tz
from collections import defaultdict
from typing import List, Optional

from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from dotenv import load_dotenv

import models, schemas
from database import engine, get_db
from auth import (
    hash_password, verify_password,
    create_access_token, get_current_admin, get_current_superadmin,
)
from email_alerts import check_and_alert

load_dotenv()

# Safe ML import
try:
    from predict import predict as bert_predict, model_ready
    MODEL_AVAILABLE = True
except Exception as e:
    print("⚠️ Model failed to load:", e)
    MODEL_AVAILABLE = False
    def model_ready(): return False

# Create tables + seed default admin
print("🔧 Creating database tables...")
if engine:
    try:
        models.Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Failed to create tables: {e}")
        print("⚠️ Continuing without database connection...")
else:
    print("⚠️ Database not configured - skipping table creation")

def seed_admin():
    """Create default superadmin if none exists."""
    if not engine:
        print("⚠️ Database not configured - skipping admin seeding")
        return
    print("👤 Seeding admin user...")
    try:
        db = next(get_db())
        try:
            # Use raw SQL to check if admin exists (avoids issues with new columns)
            from sqlalchemy import text
            result = db.execute(text("SELECT COUNT(*) FROM admin_users")).scalar()
            if result == 0:
                db.add(models.AdminUser(
                    email="admin@university.edu",
                    hashed_password=hash_password("admin123"),
                    status="active",
                    is_superadmin=True,   # first admin is always superadmin
                ))
                db.commit()
                print("✅ Default superadmin created: admin@university.edu / admin123")
            else:
                print("✅ Admin user already exists")
        finally:
            db.close()
    except Exception as e:
        print(f"⚠️ Failed to seed admin: {e}")

seed_admin()

app = FastAPI(title="UniFeedback API", version="2.0.0")

@app.on_event("startup")
async def startup_event():
    """Pre-load the BERT model at startup so first prediction is fast."""
    print("🚀 Startup begin...")
    print("📊 Connecting to database...")
    try:
        # Test database connection
        from sqlalchemy import text
        db = next(get_db())
        db.execute(text("SELECT 1"))
        db.close()
        print("✅ Database connected successfully")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
    
    print("🤖 Loading BERT model...")
    if MODEL_AVAILABLE:
        print("✅ BERT model available (uses Hugging Face API)")
    else:
        print("⚠️ Model not available")
    
    print("✅ Startup complete!")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "https://student-sentiment-analysis-chi.vercel.app",
        "https://student-sentiment-analysis.onrender.com",
        "https://student-sentiment-analysis-*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ── Health ────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "running", "model_available": MODEL_AVAILABLE}

@app.get("/api/status")
def status():
    return {
        "api": "running",
        "model_ready": MODEL_AVAILABLE,
        "message": "BERT model loaded and ready" if MODEL_AVAILABLE
                   else "Model files missing",
    }

# ── Auth ──────────────────────────────────────────────────
@app.post("/api/auth/login", response_model=schemas.TokenOut)
def admin_login(payload: schemas.AdminLogin, db: Session = Depends(get_db)):
    user = db.query(models.AdminUser).filter(
        models.AdminUser.email == payload.email
    ).first()

    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if getattr(user, "status", "active") == "pending":
        raise HTTPException(status_code=403, detail="Your account is pending activation. Check your email for the activation link.")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Your account has been deactivated. Contact the superadmin.")

    token = create_access_token({"sub": user.email, "is_superadmin": user.is_superadmin})
    return {"access_token": token, "token_type": "bearer", "email": user.email, "is_superadmin": user.is_superadmin}

# ── Student Registration (PUBLIC) ─────────────────────────
@app.post("/api/auth/student-register")
def student_register(payload: schemas.StudentRegister, db: Session = Depends(get_db)):
    # Check if student already exists
    existing_email = db.query(models.Student).filter(models.Student.email == payload.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    existing_id = db.query(models.Student).filter(models.Student.student_id == payload.student_id).first()
    if existing_id:
        raise HTTPException(status_code=400, detail="Student ID already registered")
    
    # Create new student
    hashed_pwd = hash_password(payload.password)
    new_student = models.Student(
        name=payload.name,
        email=payload.email,
        student_id=payload.student_id,
        password_hash=hashed_pwd,
        is_active=True
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    
    return {
        "id": new_student.id,
        "name": new_student.name,
        "email": new_student.email,
        "student_id": new_student.student_id,
        "message": "Registration successful! You can now login."
    }

# ── Student Login (PUBLIC) ────────────────────────────────
@app.post("/api/auth/student-login")
def student_login(payload: schemas.StudentLogin, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(
        models.Student.student_id == payload.student_id
    ).first()
    if not student or not verify_password(payload.password, student.password_hash):
        raise HTTPException(status_code=401, detail="Invalid Student ID or password")
    if not student.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    token = create_access_token(data={"sub": student.email, "role": "student"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "name": student.name,
        "email": student.email,
        "student_id": student.student_id,
    }

# ── Submit feedback (PUBLIC — students are anonymous) ─────
@app.post("/api/feedback", response_model=schemas.FeedbackOut)
def submit_feedback(payload: schemas.FeedbackCreate, db: Session = Depends(get_db)):
    sentiment  = "unknown"
    confidence = 0.0

    if MODEL_AVAILABLE:
        try:
            result     = bert_predict(payload.text)
            sentiment  = result["sentiment"]
            confidence = result["confidence"]
        except Exception as e:
            print("⚠️ Prediction failed:", e)

    # Hash session_id so admin can never trace feedback to a student
    import hashlib
    session_hash = hashlib.sha256(payload.session_id.encode()).hexdigest() if payload.session_id else None

    entry = models.Feedback(
        service      = payload.service,
        theme        = payload.theme,
        text         = payload.text,
        sentiment    = sentiment,
        confidence   = confidence,
        session_hash = session_hash,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    # Check if alert threshold exceeded (runs in background)
    try:
        check_and_alert(db, payload.service, payload.theme)
    except Exception:
        pass

    return entry

# ── Get feedback (PROTECTED) ──────────────────────────────
@app.get("/api/feedback", response_model=List[schemas.FeedbackOut])
def get_feedback(
    service:    Optional[str] = Query(None),
    sentiment:  Optional[str] = Query(None),
    theme:      Optional[str] = Query(None),
    date_from:  Optional[str] = Query(None, description="YYYY-MM-DD"),
    date_to:    Optional[str] = Query(None, description="YYYY-MM-DD"),
    limit:      int = 500,
    offset:     int = 0,
    db: Session = Depends(get_db),
    _admin = Depends(get_current_admin),
):
    q = db.query(models.Feedback)
    if service:   q = q.filter(models.Feedback.service   == service)
    if sentiment: q = q.filter(models.Feedback.sentiment == sentiment)
    if theme:     q = q.filter(models.Feedback.theme     == theme)
    if date_from:
        q = q.filter(models.Feedback.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        q = q.filter(models.Feedback.created_at <= datetime.fromisoformat(date_to + "T23:59:59"))
    return q.order_by(models.Feedback.created_at.desc()).offset(offset).limit(limit).all()

# ── CSV Export (PROTECTED) ────────────────────────────────
@app.get("/api/feedback/export")
def export_feedback_csv(
    service:   Optional[str] = Query(None),
    sentiment: Optional[str] = Query(None),
    theme:     Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to:   Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _admin = Depends(get_current_admin),
):
    q = db.query(models.Feedback)
    if service:   q = q.filter(models.Feedback.service   == service)
    if sentiment: q = q.filter(models.Feedback.sentiment == sentiment)
    if theme:     q = q.filter(models.Feedback.theme     == theme)
    if date_from:
        q = q.filter(models.Feedback.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        q = q.filter(models.Feedback.created_at <= datetime.fromisoformat(date_to + "T23:59:59"))

    rows = q.order_by(models.Feedback.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Service", "Theme", "Feedback", "Sentiment", "Confidence", "Date"])
    for r in rows:
        writer.writerow([
            r.id, r.service, r.theme, r.text,
            r.sentiment, f"{r.confidence:.2%}",
            r.created_at.strftime("%Y-%m-%d %H:%M"),
        ])

    output.seek(0)
    filename = f"feedback_export_{datetime.now().strftime('%Y%m%d_%H%M')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )

# ── Stats (PROTECTED) ─────────────────────────────────────
@app.get("/api/stats")
def get_stats(
    date_from: Optional[str] = Query(None),
    date_to:   Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _admin = Depends(get_current_admin),
):
    q = db.query(models.Feedback.sentiment, func.count().label("count"))
    if date_from:
        q = q.filter(models.Feedback.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        q = q.filter(models.Feedback.created_at <= datetime.fromisoformat(date_to + "T23:59:59"))

    rows  = q.group_by(models.Feedback.sentiment).all()
    stats = {r.sentiment: r.count for r in rows}
    total = sum(stats.values())

    def pct(n): return round((n / total * 100), 1) if total else 0.0

    # Anonymous student counts — no identifying info exposed
    total_students = db.query(func.count(models.Student.id)).scalar() or 0
    # Count distinct session hashes that submitted feedback (anonymous)
    students_with_feedback = db.query(func.count(models.Feedback.session_hash.distinct())).filter(
        models.Feedback.session_hash.isnot(None)
    ).scalar() or 0

    return {
        "total":        total,
        "positive":     stats.get("positive", 0),
        "neutral":      stats.get("neutral",  0),
        "negative":     stats.get("negative", 0),
        "positive_pct": pct(stats.get("positive", 0)),
        "neutral_pct":  pct(stats.get("neutral",  0)),
        "negative_pct": pct(stats.get("negative", 0)),
        "total_students":          total_students,
        "students_with_feedback":  students_with_feedback,
    }

# ── Service stats (PROTECTED) ─────────────────────────────
@app.get("/api/stats/services")
def get_service_stats(
    date_from: Optional[str] = Query(None),
    date_to:   Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _admin = Depends(get_current_admin),
):
    q = db.query(
        models.Feedback.service,
        models.Feedback.sentiment,
        func.count(models.Feedback.id),
    )
    if date_from:
        q = q.filter(models.Feedback.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        q = q.filter(models.Feedback.created_at <= datetime.fromisoformat(date_to + "T23:59:59"))

    rows = q.group_by(models.Feedback.service, models.Feedback.sentiment).all()
    agg  = defaultdict(lambda: {"positive": 0, "neutral": 0, "negative": 0, "error": 0, "total": 0})
    for service, sentiment, count in rows:
        if sentiment not in ["positive", "neutral", "negative", "error"]:
            sentiment = "error"
        agg[service][sentiment] += count
        agg[service]["total"]   += count
    return [{"service": s, **v} for s, v in agg.items()]

# ── Theme stats (PROTECTED) ───────────────────────────────
@app.get("/api/stats/themes")
def get_theme_stats(
    date_from: Optional[str] = Query(None),
    date_to:   Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _admin = Depends(get_current_admin),
):
    q = db.query(
        models.Feedback.theme,
        models.Feedback.sentiment,
        func.count(models.Feedback.id),
    )
    if date_from:
        q = q.filter(models.Feedback.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        q = q.filter(models.Feedback.created_at <= datetime.fromisoformat(date_to + "T23:59:59"))

    rows = q.group_by(models.Feedback.theme, models.Feedback.sentiment).all()
    agg  = defaultdict(lambda: {"positive": 0, "neutral": 0, "negative": 0, "error": 0, "total": 0})
    for theme, sentiment, count in rows:
        if sentiment not in ["positive", "neutral", "negative", "error"]:
            sentiment = "error"
        agg[theme][sentiment] += count
        agg[theme]["total"]   += count
    return [{"theme": t, **v} for t, v in agg.items()]

# ── Password Reset (PUBLIC) ───────────────────────────────
import secrets
from datetime import timezone as tz

class ResetRequestPayload(BaseModel):
    email: str

class ResetConfirmPayload(BaseModel):
    token: str
    new_password: str

@app.post("/api/auth/reset-request")
def request_password_reset(payload: ResetRequestPayload, db: Session = Depends(get_db)):
    """
    Step 1 — Admin requests a password reset.
    Always returns success (don't reveal if email exists).
    The request is logged for the superadmin to handle on the Admin Users page.
    """
    user = db.query(models.AdminUser).filter(
        models.AdminUser.email == payload.email.strip()
    ).first()

    if not user:
        # Don't reveal whether email exists
        return {"message": "If that email is registered, a reset request has been submitted to the superadmin."}

    # Invalidate any existing unused tokens for this email
    db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.email == payload.email,
        models.PasswordResetToken.used == False,
    ).delete()

    token = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(minutes=15)

    db.add(models.PasswordResetToken(
        email=payload.email,
        token=token,
        role="admin",
        expires_at=expires,
    ))
    db.commit()

    # Send reset link via email
    try:
        from email_alerts import send_password_reset_link
        send_password_reset_link(payload.email.strip(), token)
    except Exception as e:
        print(f"⚠️ Password reset email failed: {e}")

    return {"message": "If that email is registered, a reset link has been sent to your email."}


@app.post("/api/auth/reset-confirm")
def confirm_password_reset(payload: ResetConfirmPayload, db: Session = Depends(get_db)):
    """Step 2 — Submit new password with the reset token."""
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    row = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token == payload.token,
        models.PasswordResetToken.used  == False,
        models.PasswordResetToken.role  == "admin",
    ).first()

    if not row:
        raise HTTPException(status_code=400, detail="Invalid or already used reset token")

    if datetime.utcnow() > row.expires_at.replace(tzinfo=None):
        raise HTTPException(status_code=400, detail="Reset token has expired. Request a new one.")

    user = db.query(models.AdminUser).filter(
        models.AdminUser.email == row.email
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="Admin account not found")

    user.hashed_password = hash_password(payload.new_password)
    row.used = True
    db.commit()

    return {"message": "Password reset successfully. You can now log in with your new password."}


# ── Admin activation (new admin sets password via invitation link) ──
class AdminActivatePayload(BaseModel):
    token: str
    new_password: str

@app.post("/api/auth/activate-admin")
def activate_admin(payload: AdminActivatePayload, db: Session = Depends(get_db)):
    """New admin activates their account by setting a password via the invitation token."""
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    row = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token == payload.token,
        models.PasswordResetToken.used == False,
        models.PasswordResetToken.role == "admin_activation",
    ).first()

    if not row:
        raise HTTPException(status_code=400, detail="Invalid or already used activation token")

    if datetime.utcnow() > row.expires_at.replace(tzinfo=None):
        raise HTTPException(status_code=400, detail="Activation token has expired. Contact the superadmin for a new invitation.")

    user = db.query(models.AdminUser).filter(
        models.AdminUser.email == row.email
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="Admin account not found")

    # Set password and activate
    user.hashed_password = hash_password(payload.new_password)
    user.status = "active"
    row.used = True
    db.commit()

    # Activity log
    db.add(models.ActivityLog(
        actor=user.email,
        role="admin",
        action="activate_account",
        target=user.email,
        detail="Admin activated their account and set password",
    ))
    db.commit()

    return {"message": "Account activated successfully. You can now log in with your email and password."}


class PredictInput(BaseModel):
    text: str

@app.post("/api/predict")
def quick_predict(
    payload: PredictInput,
    _admin = Depends(get_current_admin),
):
    if not MODEL_AVAILABLE:
        raise HTTPException(status_code=500, detail="Model not available")
    try:
        return bert_predict(payload.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Admin user management (SUPERADMIN ONLY) ──────────────
@app.get("/api/admin/users")
def list_admins(
    db: Session = Depends(get_db),
    _admin = Depends(get_current_superadmin),   # superadmin only
):
    users = db.query(models.AdminUser).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "status": getattr(u, "status", "active"),
            "is_active": u.is_active,
            "is_superadmin": u.is_superadmin,
            "created_at": u.created_at,
        }
        for u in users
    ]

class CreateAdminPayload(BaseModel):
    email: str
    is_superadmin: bool = False

@app.post("/api/admin/users", status_code=201)
def create_admin(
    payload: CreateAdminPayload,
    db: Session = Depends(get_db),
    _admin = Depends(get_current_superadmin),   # superadmin only
):
    existing = db.query(models.AdminUser).filter(models.AdminUser.email == payload.email.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create admin with status=pending, no password yet
    user = models.AdminUser(
        email=payload.email.strip(),
        hashed_password=None,
        status="pending",
        is_superadmin=payload.is_superadmin,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate invitation token (24-hour expiry)
    token = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(hours=24)

    db.add(models.PasswordResetToken(
        email=payload.email.strip(),
        token=token,
        role="admin_activation",
        expires_at=expires,
    ))
    db.commit()

    # Send activation email
    email_sent = False
    try:
        from email_alerts import send_activation_link
        email_sent = send_activation_link(payload.email.strip(), token)
    except Exception as e:
        print(f"⚠️ Activation email failed: {e}")

    # Activity log
    db.add(models.ActivityLog(
        actor=_admin.email,
        role="super_admin",
        action="create_admin",
        target=user.email,
        detail=f"Created admin (superadmin={user.is_superadmin}), activation email {'sent' if email_sent else 'failed'}",
    ))
    db.commit()

    return {
        "id": user.id,
        "email": user.email,
        "is_superadmin": user.is_superadmin,
        "status": user.status,
        "created_at": user.created_at,
    }

@app.patch("/api/admin/users/{user_id}/toggle")
def toggle_admin_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_superadmin),
):
    """Activate or deactivate an admin account."""
    user = db.query(models.AdminUser).filter(models.AdminUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Admin not found")
    if user.email == current_admin.email:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
    user.is_active = not user.is_active
    db.commit()

    # Activity log
    db.add(models.ActivityLog(
        actor=current_admin.email,
        role="super_admin",
        action="toggle_admin",
        target=user.email,
        detail=f"{'Activated' if user.is_active else 'Suspended'} admin",
    ))
    db.commit()

    return {"id": user.id, "email": user.email, "is_active": user.is_active}

@app.delete("/api/admin/users/{user_id}")
def delete_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_superadmin),
):
    user = db.query(models.AdminUser).filter(models.AdminUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Admin not found")
    if user.email == current_admin.email:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    db.delete(user)
    db.commit()

    # Activity log
    db.add(models.ActivityLog(
        actor=current_admin.email,
        role="super_admin",
        action="delete_admin",
        target=user.email,
        detail=f"Deleted admin {user.email}",
    ))
    db.commit()

    return {"message": f"Admin {user.email} deleted"}


@app.patch("/api/admin/users/{user_id}/set-password")
def superadmin_set_password(
    user_id: int,
    db: Session = Depends(get_db),
    _admin = Depends(get_current_superadmin),
):
    """Superadmin triggers a password reset for any admin — a secure reset link is emailed."""
    user = db.query(models.AdminUser).filter(models.AdminUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Admin not found")

    # Invalidate any existing unused tokens for this admin
    db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.email == user.email,
        models.PasswordResetToken.used == False,
    ).update({"used": True})

    # Generate a new reset token
    token = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(minutes=15)

    db.add(models.PasswordResetToken(
        email=user.email,
        token=token,
        role="admin",
        expires_at=expires,
    ))
    db.commit()

    # Send reset link via email (no plain text password)
    email_sent = False
    try:
        from email_alerts import send_password_reset_link
        email_sent = send_password_reset_link(user.email, token)
    except Exception as e:
        print(f"⚠️ Password reset email failed: {e}")

    # Activity log
    db.add(models.ActivityLog(
        actor=_admin.email,
        role="super_admin",
        action="trigger_password_reset",
        target=user.email,
        detail=f"Triggered password reset for admin",
    ))
    db.commit()

    note = " Reset link emailed to admin." if email_sent else " (Email not configured — share the reset link manually.)"
    return {"message": f"Password reset link generated for {user.email}.{note}"}


@app.get("/api/admin/users/{user_id}/reset-requests")
def get_reset_requests(
    user_id: int,
    db: Session = Depends(get_db),
    _admin = Depends(get_current_superadmin),
):
    """Superadmin sees pending password reset requests for a specific admin."""
    user = db.query(models.AdminUser).filter(models.AdminUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Admin not found")
    tokens = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.email == user.email,
        models.PasswordResetToken.used  == False,
    ).order_by(models.PasswordResetToken.created_at.desc()).all()
    return {
        "email": user.email,
        "pending_requests": len(tokens),
        "has_pending": len(tokens) > 0,
        "latest_expires": tokens[0].expires_at.isoformat() if tokens else None,
    }


@app.get("/api/admin/reset-requests")
def all_reset_requests(
    db: Session = Depends(get_db),
    _admin = Depends(get_current_superadmin),
):
    """Superadmin sees ALL pending password reset requests across all admins."""
    tokens = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.used == False,
    ).order_by(models.PasswordResetToken.created_at.desc()).all()

    result = []
    for t in tokens:
        result.append({
            "email":      t.email,
            "requested":  t.created_at.isoformat(),
            "expires_at": t.expires_at.isoformat(),
        })
    return result

# ── Student forgot password ─────────────────────────────────
class StudentResetRequestPayload(BaseModel):
    email: str

@app.post("/api/auth/student-reset-request")
def student_reset_request(payload: StudentResetRequestPayload, db: Session = Depends(get_db)):
    """Student requests a password reset — a secure link is emailed if the account exists."""
    student = db.query(models.Student).filter(
        models.Student.email == payload.email.strip()
    ).first()

    if not student:
        # Don't reveal whether email exists
        return {"message": "If that email is registered, a reset link has been sent."}

    # Invalidate any existing unused tokens for this email
    db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.email == payload.email,
        models.PasswordResetToken.used == False,
    ).update({"used": True})

    token = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(minutes=15)

    db.add(models.PasswordResetToken(
        email=payload.email.strip(),
        token=token,
        role="student",
        expires_at=expires,
    ))
    db.commit()

    # Send reset link via email
    try:
        from email_alerts import send_student_reset_link
        send_student_reset_link(payload.email.strip(), token)
    except Exception as e:
        print(f"⚠️ Student reset email failed: {e}")

    return {"message": "If that email is registered, a reset link has been sent."}


class StudentResetConfirmPayload(BaseModel):
    token: str
    new_password: str

@app.post("/api/auth/student-reset-confirm")
def student_reset_confirm(payload: StudentResetConfirmPayload, db: Session = Depends(get_db)):
    """Student sets a new password using the reset token."""
    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    row = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token == payload.token,
        models.PasswordResetToken.used == False,
        models.PasswordResetToken.role == "student",
    ).first()

    if not row:
        raise HTTPException(status_code=400, detail="Invalid or already used reset token")

    if datetime.utcnow() > row.expires_at.replace(tzinfo=None):
        raise HTTPException(status_code=400, detail="Reset token has expired. Request a new one.")

    student = db.query(models.Student).filter(
        models.Student.email == row.email
    ).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student account not found")

    student.password_hash = hash_password(payload.new_password)
    row.used = True
    db.commit()

    return {"message": "Password reset successfully. You can now log in with your new password."}


# ── Student management (SUPERADMIN ONLY) ─────────────────
@app.get("/api/admin/students")
def list_students(
    db: Session = Depends(get_db),
    _admin = Depends(get_current_superadmin),
):
    """Superadmin lists all students."""
    students = db.query(models.Student).order_by(models.Student.created_at.desc()).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "email": s.email,
            "student_id": s.student_id,
            "is_active": s.is_active,
            "created_at": s.created_at,
        }
        for s in students
    ]


@app.patch("/api/admin/students/{student_id}/toggle")
def toggle_student_status(
    student_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_superadmin),
):
    """Superadmin activates or deactivates a student account."""
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    student.is_active = not student.is_active
    db.commit()

    # Activity log
    db.add(models.ActivityLog(
        actor=current_admin.email,
        role="super_admin",
        action="toggle_student",
        target=student.email,
        detail=f"{'Activated' if student.is_active else 'Suspended'} student {student.name}",
    ))
    db.commit()

    return {"id": student.id, "email": student.email, "is_active": student.is_active}


# ── Activity logs (SUPERADMIN ONLY) ──────────────────────
@app.get("/api/admin/activity-logs")
def get_activity_logs(
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    _admin = Depends(get_current_superadmin),
):
    """Superadmin views recent activity logs."""
    logs = db.query(models.ActivityLog).order_by(
        models.ActivityLog.created_at.desc()
    ).limit(limit).all()
    return [
        {
            "id": l.id,
            "actor": l.actor,
            "role": l.role,
            "action": l.action,
            "target": l.target,
            "detail": l.detail,
            "created_at": l.created_at,
        }
        for l in logs
    ]


# ── Student feedback history (anonymous — by session token) ──
@app.get("/api/student/history")
def student_history(
    session_id: str = Query(..., description="Anonymous session ID from browser"),
    db: Session = Depends(get_db),
):
    """
    Returns feedback submitted by this anonymous session.
    session_id is generated in the browser and stored in localStorage.
    No personal data is stored — purely anonymous tracking.
    """
    # Hash the incoming session_id to match against stored hash
    import hashlib
    session_hash = hashlib.sha256(session_id.encode()).hexdigest()

    rows = db.query(models.Feedback).filter(
        models.Feedback.session_hash == session_hash
    ).order_by(models.Feedback.created_at.desc()).all()

    # Return without session_hash — never expose the hash to the client
    return [
        {
            "id":         r.id,
            "service":    r.service,
            "theme":      r.theme,
            "text":       r.text,
            "sentiment":  r.sentiment,
            "confidence": r.confidence,
            "created_at": r.created_at,
        }
        for r in rows
    ]


# ── Run server ────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting UniFeedback API server...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
