import random
import string
from datetime import datetime, timedelta
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.core.config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)

def generate_otp() -> str:
    return ''.join(random.choices(string.digits, k=6))

def otp_expiry() -> datetime:
    return datetime.utcnow() + timedelta(minutes=10)

async def send_otp_email(email: str, otp: str):
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;background:#0A0A0A;color:#fff;padding:48px 40px;border-radius:20px;border:1px solid #2A2A2A;">
        <div style="margin-bottom:32px;">
            <span style="font-size:24px;font-weight:900;color:#fff;">Job<span style="color:#00C853;">ify</span></span>
        </div>
        <h2 style="font-size:22px;font-weight:800;margin:0 0 8px 0;color:#fff;">Verify your email</h2>
        <p style="color:#888;margin:0 0 32px 0;font-size:15px;line-height:1.6;">
            Use the OTP below to complete your registration. It expires in <strong style="color:#fff;">10 minutes</strong>.
        </p>
        <div style="background:#111;border:1px solid #2A2A2A;border-radius:16px;padding:32px;text-align:center;margin-bottom:32px;">
            <p style="color:#666;font-size:11px;margin:0 0 12px 0;letter-spacing:3px;text-transform:uppercase;">Your One-Time Password</p>
            <p style="font-size:48px;font-weight:900;color:#00C853;letter-spacing:16px;margin:0;font-family:monospace;">{otp}</p>
        </div>
        <p style="color:#555;font-size:13px;line-height:1.6;margin:0;">
            If you didn't create a Jobify account, you can safely ignore this email.<br/>
            Never share this OTP with anyone.
        </p>
        <div style="margin-top:40px;padding-top:24px;border-top:1px solid #1A1A1A;">
            <p style="color:#444;font-size:12px;margin:0;">© 2026 Jobify · Built for verified hiring</p>
        </div>
    </div>
    """
    message = MessageSchema(
        subject="Jobify — Your Verification Code",
        recipients=[email],
        body=html,
        subtype="html"
    )
    fm = FastMail(conf)
    await fm.send_message(message)
