"""
email_alerts.py — sends email via Resend API (free, 3,000 emails/month).
Configure RESEND_API_KEY and MAIL_FROM in .env to enable.
"""
import os
import requests as _requests
from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
MAIL_FROM      = os.getenv("MAIL_FROM", "UniFeedback <onboarding@resend.dev>")
ALERT_TO       = os.getenv("ALERT_EMAIL", "")
THRESHOLD       = int(os.getenv("NEGATIVE_ALERT_THRESHOLD", 10))
RESEND_API_URL  = "https://api.resend.com/emails"

def _send_via_resend(to: str, subject: str, html: str) -> bool:
    """Internal helper — send an HTML email via Resend API. Returns True on success."""
    if not RESEND_API_KEY:
        print(f"⚠️ RESEND_API_KEY not set — email to {to} skipped")
        return False
    try:
        resp = _requests.post(
            RESEND_API_URL,
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": MAIL_FROM,
                "to": [to],
                "subject": subject,
                "html": html,
            },
        )
        if resp.status_code in (200, 201):
            print(f"✅ Email sent to {to}")
            return True
        else:
            print(f"❌ Resend error {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        print(f"❌ Email send failed: {e}")
        return False


def send_alert(service: str, theme: str, count: int):
    """Send email alert when negative feedback threshold is exceeded."""
    if not ALERT_TO:
        print(f"⚠️ ALERT_EMAIL not set — alert skipped for {service}/{theme} ({count} negatives)")
        return

    html = f"""
    <html><body style="font-family:sans-serif;padding:20px">
      <h2 style="color:#dc2626">⚠️ Critical Feedback Alert</h2>
      <p>The following issue has exceeded the negative feedback threshold:</p>
      <table style="border-collapse:collapse;width:100%;max-width:500px">
        <tr><td style="padding:8px;background:#f9fafb;font-weight:bold">Service</td>
            <td style="padding:8px">{service}</td></tr>
        <tr><td style="padding:8px;background:#f9fafb;font-weight:bold">Theme</td>
            <td style="padding:8px">{theme}</td></tr>
        <tr><td style="padding:8px;background:#f9fafb;font-weight:bold">Negative Responses</td>
            <td style="padding:8px;color:#dc2626;font-weight:bold">{count}</td></tr>
        <tr><td style="padding:8px;background:#f9fafb;font-weight:bold">Threshold</td>
            <td style="padding:8px">{THRESHOLD}</td></tr>
      </table>
      <p style="margin-top:20px">
        <a href="http://localhost:5173/dashboard/recommendations"
           style="background:#4f46e5;color:white;padding:10px 20px;border-radius:8px;text-decoration:none">
          View Recommendations
        </a>
      </p>
    </body></html>
    """
    _send_via_resend(ALERT_TO, f"🚨 UniFeedback Alert: {service} — {theme}", html)


def check_and_alert(db, service: str, theme: str):
    """Check if negative count exceeds threshold and send alert if so."""
    from sqlalchemy import func
    import models as m

    count = db.query(func.count(m.Feedback.id)).filter(
        m.Feedback.service   == service,
        m.Feedback.theme     == theme,
        m.Feedback.sentiment == "negative",
    ).scalar()

    if count and count >= THRESHOLD:
        send_alert(service, theme, count)


def send_password_reset_link(to_email: str, token: str):
    """Send email with a secure password-reset link (token-based). No plain text password is ever sent."""
    reset_url = f"http://localhost:5173/admin/reset-password?token={token}"
    html = f"""
    <html><body style="font-family:sans-serif;padding:20px">
      <h2 style="color:#4f46e5">Password Reset Request</h2>
      <p>A password reset was requested for your account.</p>
      <p style="margin-top:16px">
        <a href="{reset_url}"
           style="background:#4f46e5;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block">
          Reset Your Password
        </a>
      </p>
      <p style="margin-top:20px;color:#6b7280;font-size:13px">
        This link expires in 15 minutes. If you did not request this reset, you can safely ignore this email.
      </p>
    </body></html>
    """
    return _send_via_resend(to_email, "UniFeedback — Reset Your Password", html)


def send_student_reset_link(to_email: str, token: str):
    """Send email with a secure password-reset link for a student account."""
    reset_url = f"http://localhost:5173/student/reset-password?token={token}"
    html = f"""
    <html><body style="font-family:sans-serif;padding:20px">
      <h2 style="color:#4f46e5">Password Reset Request</h2>
      <p>A password reset was requested for your student account.</p>
      <p style="margin-top:16px">
        <a href="{reset_url}"
           style="background:#4f46e5;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block">
          Reset Your Password
        </a>
      </p>
      <p style="margin-top:20px;color:#6b7280;font-size:13px">
        This link expires in 15 minutes. If you did not request this reset, you can safely ignore this email.
      </p>
    </body></html>
    """
    return _send_via_resend(to_email, "UniFeedback — Reset Your Student Password", html)


def send_feedback_confirmation(to_email: str, service: str, theme: str, sentiment: str, feedback_id: int):
    """Send a confirmation email to the individual who submitted feedback."""
    sentiment_styles = {
        "positive": ("✅", "#16a34a", "Positive"),
        "neutral":  ("😐", "#ca8a04", "Neutral"),
        "negative": ("⚠️", "#dc2626", "Negative"),
    }
    icon, color, label = sentiment_styles.get(sentiment, ("❓", "#6b7280", sentiment.capitalize()))

    html = f"""
    <html><body style="font-family:sans-serif;padding:20px;max-width:560px;margin:0 auto">
      <h2 style="color:#4f46e5">📬 Feedback Received</h2>
      <p>Thank you for sharing your experience. Your feedback has been recorded successfully.</p>
      <table style="border-collapse:collapse;width:100%;max-width:500px;margin:16px 0">
        <tr><td style="padding:8px;background:#f9fafb;font-weight:bold">Reference</td>
            <td style="padding:8px">#{feedback_id}</td></tr>
        <tr><td style="padding:8px;background:#f9fafb;font-weight:bold">Service</td>
            <td style="padding:8px">{service}</td></tr>
        <tr><td style="padding:8px;background:#f9fafb;font-weight:bold">Theme</td>
            <td style="padding:8px">{theme}</td></tr>
        <tr><td style="padding:8px;background:#f9fafb;font-weight:bold">Sentiment</td>
            <td style="padding:8px;color:{color};font-weight:bold">{icon} {label}</td></tr>
      </table>
      <p style="margin-top:12px;color:#6b7280;font-size:13px">
        Your feedback is anonymous — no personal information is shared with administrators.
        If you did not submit this feedback, you can safely ignore this email.
      </p>
    </body></html>
    """
    return _send_via_resend(to_email, f"UniFeedback — Feedback Received #{feedback_id}", html)


def send_activation_link(to_email: str, token: str):
    """Send email with activation link for a newly created admin account."""
    activate_url = f"http://localhost:5173/admin/activate?token={token}"
    html = f"""
    <html><body style="font-family:sans-serif;padding:20px">
      <h2 style="color:#4f46e5">Account Activation</h2>
      <p>An admin account has been created for you on UniFeedback.</p>
      <p style="margin-top:16px">
        <a href="{activate_url}"
           style="background:#4f46e5;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block">
          Set Your Password
        </a>
      </p>
      <p style="margin-top:20px;color:#6b7280;font-size:13px">
        This link expires in 24 hours. If you did not expect this email, you can safely ignore it.
      </p>
    </body></html>
    """
    return _send_via_resend(to_email, "UniFeedback — Activate Your Account", html)
