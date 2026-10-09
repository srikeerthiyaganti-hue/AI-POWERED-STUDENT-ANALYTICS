"""
CODEBUFFET — Authentication Routes
Handles secure sign-in with PBKDF2 hash verification, session validation, and logout.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, HTTPException, Depends, status
from backend.database import get_db_connection
from backend.auth import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    identifier: str # Email or Registration / Roll Number
    password: str
    role: Optional[str] = None # Optional role preference ('admin' | 'student')


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


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

    if not user_row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your email / registration number."
        )

    # Verify password hash
    if not verify_password(req.password, user_row["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please check your password."
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
        "role": user_row["role"],
        "role_label": user_row["role_label"],
        "department": user_row["department"],
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
    cursor.execute("SELECT id, email, roll_no, full_name, role, role_label, department, avatar_url FROM users WHERE id = ?", (current_user["sub"],))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User record not found.")

    return dict(row)
