# CODEBUFFET — Security, Cryptography & Credentials Policy
### Password Hashing, JWT Architecture, Role Authorization, and Anti-IDOR Governance

---

## 1. Cryptographic Password Hashing

All user account passwords stored in the database are hashed using the NIST-approved **PBKDF2-HMAC-SHA256** standard with unique per-user cryptographically random salts:

```python
# Format: <salt_hex>:<hash_hex>
salt = secrets.token_bytes(16)
key = hashlib.pbkdf2_hmac(
    "sha256",
    password.encode("utf-8"),
    salt,
    100000, # 100,000 iterations
    dklen=64
)
```

### Password Verification
Verification uses constant-time string comparison (`secrets.compare_digest`) to protect against timing attacks:
```python
secrets.compare_digest(actual_key, expected_key)
```

---

## 2. JWT Architecture & Secret Key Governance

- **Token Standard:** JSON Web Token (JWT) signed via HMAC-SHA256 (`HS256`).
- **Token Expiry:** Configured via `ACCESS_TOKEN_EXPIRE_MINUTES` (defaults to 1,440 minutes = 24 hours).
- **Environment Isolation:** `SECRET_KEY` is loaded strictly from a local, git-ignored `.env` file via `python-dotenv`.
- **Zero Static Fallback:** If `SECRET_KEY` is omitted, the service generates an ephemeral 64-character random key at runtime, ensuring no predictable hardcoded secret can ever be exploited.
- **Git Protection:** `.env`, `*.db`, and credentials files are explicitly ignored in `.gitignore`.

---

## 3. Server-Side Role-Based Access Control (RBAC)

FastAPI endpoints enforce strict authorization using dependency factories:

```python
def require_roles(allowed_roles: list[str]):
    async def role_verifier(current_user: Dict[str, Any] = Depends(get_current_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Role '{current_user.get('role')}' is not authorized."
            )
        return current_user
    return role_verifier
```

### Institutional Role Hierarchy

| Role Code | Title | Accessible Routes | Description |
|---|---|---|---|
| `admin` | Institution Admin | `/api/institution/*`, `/api/student/*` | Full institutional oversight, student enrollment, mentor assignment. |
| `mentor` | Faculty Mentor | `/api/institution/*` (mentee scope), `/api/student/*` | Mentee tracking, intervention task creation and status toggles. |
| `tpo` | Placement Director | `/api/institution/*` (placement scope), `/api/student/*` | Placement cohort tracking, mock interview scheduling, readiness tiers. |
| `student` | Student | `/api/student/*` (self only) | Personal cockpit, simulation engine, assigned task updates. |

---

## 4. Anti-Insecure Direct Object Reference (Anti-IDOR)

In the student portal endpoint (`/api/student/dashboard`), strict authorization checks prevent students from viewing or mutating the telemetry of their peers:

```python
user_role = current_user.get("role")
user_roll = current_user.get("roll_no")

if user_role == "student":
    target_roll = user_roll or "STU-2024-042"
    if roll_no and roll_no.strip().upper() != target_roll.upper():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: Students may only view their personal cockpit telemetry."
        )
```

Furthermore, requesting any non-existent student roll number returns a strict `HTTP 404 NOT FOUND` rather than silently leaking another student's record.

---

## 5. Demonstration & Evaluation Accounts

The platform includes four pre-seeded accounts for local hackathon evaluation:

| Account | Role | Identifier | Seed Password | Scope |
|---|---|---|---|---|
| **Dr. R. Kumar** | Institution Admin | `admin@codebuffet.edu` | `CodeBuffet@2026!` | Central Administration |
| **Prof. Rajesh Kumar** | Faculty Mentor | `rajesh.kumar@codebuffet.edu` | `Mentor@2026!` | CSE Mentorship (~15 students) |
| **Vikram Malhotra** | Placement Director | `vikram.tpo@codebuffet.edu` | `TPO@2026!` | Career & Corporate Relations |
| **Aarav Sharma** | Student (B.Tech) | `STU-2024-042` | `Student@2026!` | Student Cockpit |
