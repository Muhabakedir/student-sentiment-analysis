from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# ── Feedback ──────────────────────────────────────────────
class FeedbackCreate(BaseModel):
    service: str
    theme: str
    text: str
    session_id: str = ""  # anonymous browser session ID
    email: Optional[str] = None  # optional — for confirmation email

class FeedbackOut(BaseModel):
    id: int
    service: str
    theme: str
    text: str
    sentiment: str
    confidence: float
    email: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ── Auth ──────────────────────────────────────────────────
class AdminLogin(BaseModel):
    email: str
    password: str

class StudentRegister(BaseModel):
    name: str
    email: str
    student_id: str
    password: str

class StudentLogin(BaseModel):
    student_id: str
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str
    email: str
    is_superadmin: bool

# ── Stats ─────────────────────────────────────────────────
class StatsOut(BaseModel):
    total: int
    positive: int
    neutral: int
    negative: int
    positive_pct: float
    neutral_pct: float
    negative_pct: float

class ServiceStat(BaseModel):
    service: str
    positive: int
    neutral: int
    negative: int
    total: int

class ThemeStat(BaseModel):
    theme: str
    positive: int
    neutral: int
    negative: int
    total: int
