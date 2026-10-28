"""
CODEBUFFET — Authentication Routes
Handles secure sign-in with PBKDF2 hash verification, session validation, and logout.
"""

import os
import re
import secrets
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, HTTPException, Depends, status
from backend.database import get_db_connection, record_audit_log
from backend.auth import verify_password, hash_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    phone_number: str
    email: EmailStr
    password: str
    confirm_password: str
    role: str # "Institution Officer", "Student", "Faculty", "Placement Officer"
    invitation_code: Optional[str] = None
    department: Optional[str] = None
    branch: Optional[str] = None
    semester: Optional[int] = None


class RegisterResponse(BaseModel):
    success: bool
    user_id: int
    email: str
    roll_no: str
    full_name: str
    role: str
    role_label: str
    status: str
    message: str


class LoginRequest(BaseModel):
    identifier: str # Email or Registration / Roll Number
    password: str
    role: Optional[str] = None # Optional role preference ('admin' | 'student')


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest):
    """
    Registers a new user in the CODEBUFFET platform.
    Enforces password strength, email uniqueness, phone validation,
    and safe role authorization (students activate immediately; privileged
    faculty/officer accounts require verification/invitation).
    """
    # 1. Field sanitization
    first_name = req.first_name.strip()
    last_name = req.last_name.strip()
    phone = req.phone_number.strip()
    clean_email = req.email.strip().lower()
    clean_role = req.role.strip().lower()
    full_name = f"{first_name} {last_name}"

    if not first_name or not last_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="First name and last name are required."
        )

    # 2. Phone number validation (allows Indian mobile numbers and international format)
    digits_only = re.sub(r'[\s\-\+\(\)]', '', phone)
    if len(digits_only) < 10 or len(digits_only) > 15:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid 10-digit mobile phone number."
        )

    # 3. Password confirmation & strength validation
    if req.password != req.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password and Confirm Password do not match."
        )

    if len(req.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long."
        )
    if not re.search(r'[A-Z]', req.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must include at least one uppercase letter (A-Z)."
        )
    if not re.search(r'[a-z]', req.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must include at least one lowercase letter (a-z)."
        )
    if not re.search(r'\d', req.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must include at least one numerical digit (0-9)."
        )
    if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]]', req.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must include at least one special character (!@#$%^&*)."
        )

    # 4. Map user-facing roles to system roles
    if "institution" in clean_role or clean_role == "admin" or "officer" in clean_role and "placement" not in clean_role:
        role = "admin"
        role_label = "Institution Officer"
        dept = req.department or "Institutional Administration"
        roll_prefix = "EMP"
    elif "student" in clean_role:
        role = "student"
        role_label = "Student"
        dept = req.branch or req.department or "Computer Science & Engineering"
        roll_prefix = "STU"
    elif "faculty" in clean_role or "mentor" in clean_role:
        role = "mentor"
        role_label = "Faculty Mentor"
        dept = req.department or "Computer Science & Engineering"
        roll_prefix = "FAC"
    elif "placement" in clean_role or "tpo" in clean_role:
        role = "tpo"
        role_label = "Placement Officer"
        dept = req.department or "Career & Corporate Relations"
        roll_prefix = "TPO"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role selected. Allowed choices: Institution Officer, Student, Faculty, Placement Officer."
        )

    # 5. Privileged role authorization check (critical administrator security requirement)
    env_codes = os.getenv("INSTITUTIONAL_INVITATION_CODES")
    if env_codes:
        privileged_codes = [c.strip() for c in env_codes.split(",") if c.strip()]
    else:
        privileged_codes = [
            "CODEBUFFET-INST-2026",
            "CODEBUFFET-FACULTY-2026",
            "CODEBUFFET-TPO-2026",
            "CodeBuffet@2026!",
            "FACULTY2026",
            "ADMIN2026",
            "TPO2026"
        ]
    if role == "student":
        account_status = "ACTIVE"
    else:
        if req.invitation_code and req.invitation_code.strip() in privileged_codes:
            account_status = "ACTIVE"
        else:
            account_status = "PENDING_APPROVAL"

    conn = get_db_connection()
    cursor = conn.cursor()

    # 6. Check unique email constraint
    cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (clean_email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please sign in instead."
        )

    # 7. Generate unique registration / roll ID
    unique_roll = f"{roll_prefix}-{datetime.now().year}-{secrets.token_hex(2).upper()}"
    p_hash = hash_password(req.password)

    cursor.execute("""
    INSERT INTO users (
        email, roll_no, password_hash, full_name, first_name, last_name, phone_number,
        role, role_label, department, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    """, (
        clean_email, unique_roll, p_hash, full_name, first_name, last_name, phone,
        role, role_label, dept, account_status
    ))
    new_user_id = cursor.lastrowid

    # If student is active, register baseline profile in students table
    if role == "student" and account_status == "ACTIVE":
        cursor.execute("SELECT id FROM students WHERE LOWER(roll_no) = ?", (unique_roll.lower(),))
        if not cursor.fetchone():
            stu_sem = req.semester if req.semester and 1 <= req.semester <= 8 else 6
            stu_year = "1st Year" if stu_sem in (1, 2) else ("2nd Year" if stu_sem in (3, 4) else ("3rd Year" if stu_sem in (5, 6) else "4th Year"))
            cursor.execute("""
            INSERT INTO students (
                roll_no, user_id, full_name, department, year, semester, cgpa, backlogs,
                overall_attendance_pct, coding_skills, dsa_score, aptitude_score,
                communication_skills, lms_assignment_completion_pct, success_score,
                academic_risk_band, academic_risk_prob,
                placement_risk_band, placement_risk_prob, record_type, assigned_mentor
            ) VALUES (?, ?, ?, ?, ?, ?, 8.0, 0, 85.0, 7.5, 7.5, 75.0, 7.5, 80.0, 80.0, 'LOW', 0.15, 'LOW', 0.20, 'verified_profile', 'Prof. Rajesh Kumar')
            """, (unique_roll, new_user_id, full_name, dept, stu_year, stu_sem))

    # Record audit log
    record_audit_log(
        conn,
        clean_email,
        role,
        "USER_REGISTERED",
        "users",
        str(new_user_id),
        f"Registered as {role_label} (Status: {account_status})"
    )

    conn.commit()
    conn.close()

    if account_status == "ACTIVE":
        msg = "Account created successfully! You can now log in with your credentials."
    else:
        msg = f"Registration submitted. Because '{role_label}' is a privileged institutional role, your account is pending administrative approval. Access will be unlocked upon verification."

    return RegisterResponse(
        success=True,
        user_id=new_user_id,
        email=clean_email,
        roll_no=unique_roll,
        full_name=full_name,
        role=role,
        role_label=role_label,
        status=account_status,
        message=msg
    )


@router.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest):
    """
    Authenticates user via identifier (email or roll number) and password.
    Returns signed JWT access token and user metadata.
    """
    ident = req.identifier.strip().lower()
    if not ident:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration number or email is required."
        )
    if not req.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is required."
        )

    conn = get_db_connection()
    cursor = conn.cursor()

    # Query by email (case-insensitive) or roll_no (case-insensitive)
    cursor.execute("""
    SELECT * FROM users
    WHERE LOWER(email) = ? OR LOWER(roll_no) = ?
    LIMIT 1
    """, (ident, ident))
    user_row = cursor.fetchone()
    conn.close()

    if not user_row or not verify_password(req.password, user_row["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/username or password"
        )

    # Verify account status (prevent pending or inactive accounts from logging in)
    account_status = user_row["status"] if "status" in user_row.keys() and user_row["status"] else "ACTIVE"
    if account_status == "PENDING_APPROVAL":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account pending administrative verification. Your institutional account requires approval before you can access the dashboard. Please contact your Institution Officer/Admin."
        )
    if account_status in ["REJECTED", "INACTIVE", "SUSPENDED"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been rejected or deactivated. Please contact your Institution Officer/Admin."
        )

    # Optional role validation if user specifically requested a portal
    user_role = user_row["role"]
    if req.role:
        if req.role == "admin" and user_role not in ["admin", "mentor", "tpo"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access restricted: This account does not possess institutional administrative privileges."
            )
        elif req.role == "student" and user_role != "student":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access restricted: This account is registered as institutional faculty/staff, not a student."
            )

    # Build token payload
    token_payload = {
        "sub": str(user_row["id"]),
        "email": user_row["email"],
        "roll_no": user_row["roll_no"],
        "role": user_row["role"],
        "name": user_row["full_name"],
        "department": user_row["department"]
    }
    token = create_access_token(token_payload)

    user_info = {
        "id": user_row["id"],
        "email": user_row["email"],
        "roll_no": user_row["roll_no"],
        "full_name": user_row["full_name"],
        "name": user_row["full_name"],
        "first_name": user_row["first_name"] if "first_name" in user_row.keys() and user_row["first_name"] else user_row["full_name"].split()[0],
        "last_name": user_row["last_name"] if "last_name" in user_row.keys() and user_row["last_name"] else (user_row["full_name"].split()[-1] if len(user_row["full_name"].split()) > 1 else ""),
        "phone_number": user_row["phone_number"] if "phone_number" in user_row.keys() and user_row["phone_number"] else "",
        "role": user_row["role"],
        "role_label": user_row["role_label"],
        "department": user_row["department"],
        "status": account_status,
        "avatar_url": user_row["avatar_url"]
    }

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=user_info
    )


@router.post("/logout")
async def logout():
    """
    Stateless JWT logout acknowledgment. Client removes token from storage.
    """
    return {"success": True, "message": "Successfully signed out of CODEBUFFET."}


@router.get("/me")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """
    Returns verified profile data for the current Bearer token holder.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, roll_no, full_name, first_name, last_name, phone_number, role, role_label, department, status, avatar_url FROM users WHERE id = ?", (current_user["sub"],))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User record not found.")

    return dict(row)
