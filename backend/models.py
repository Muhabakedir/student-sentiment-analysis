from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean
from sqlalchemy.sql import func
from database import Base

class Feedback(Base):
    __tablename__ = "feedback"
    id           = Column(Integer, primary_key=True, index=True)
    service      = Column(String, nullable=False)
    theme        = Column(String, nullable=False)
    text         = Column(String, nullable=False)
    sentiment    = Column(String, default="pending")
    confidence   = Column(Float, default=0.0)
    email        = Column(String, nullable=True)   # optional — for confirmation email
    session_hash = Column(String, nullable=True, index=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

class AdminUser(Base):
    __tablename__ = "admin_users"
    id              = Column(Integer, primary_key=True, index=True)
    email           = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)   # null until admin activates
    status          = Column(String, default="active")  # "pending" or "active"
    is_active       = Column(Boolean, default=True)
    is_superadmin   = Column(Boolean, default=False)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

class Student(Base):
    __tablename__ = "students"
    id              = Column(Integer, primary_key=True, index=True)
    name            = Column(String, nullable=False)
    email           = Column(String, unique=True, index=True, nullable=False)
    student_id      = Column(String, unique=True, index=True, nullable=False)
    password_hash   = Column(String, nullable=False)
    is_active       = Column(Boolean, default=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    id         = Column(Integer, primary_key=True, index=True)
    email      = Column(String, nullable=False, index=True)
    token      = Column(String, unique=True, nullable=False, index=True)
    used       = Column(Boolean, default=False)
    role       = Column(String, default="admin")  # "admin", "student", or "admin_activation"
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id         = Column(Integer, primary_key=True, index=True)
    actor      = Column(String, nullable=False)   # email of who performed the action
    role       = Column(String, nullable=False)   # "super_admin", "admin", "student", "system"
    action     = Column(String, nullable=False)   # e.g. "create_admin", "suspend_student", "reset_password"
    target     = Column(String, nullable=True)    # email/id of the target user
    detail     = Column(String, nullable=True)    # extra context
    created_at = Column(DateTime(timezone=True), server_default=func.now())
