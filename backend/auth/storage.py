"""
SmartSpace AI - Persistent SQLite User Storage & Repository
Provides thread-safe persistence for user accounts and role definitions.
"""

import os
import sqlite3
import datetime
import uuid
import logging
from dataclasses import dataclass, asdict
from typing import Optional, List, Dict, Any

from .security import hash_password

logger = logging.getLogger("smartspace.auth")

DB_PATH = os.getenv("SMARTSPACE_DB_PATH", os.path.join(os.path.dirname(os.path.dirname(__file__)), "smartspace.db"))


@dataclass
class User:
    id: str
    name: str
    email: str
    hashed_password: str
    role: str  # "USER" | "ADMIN" | "RESEARCH"
    created_at: str
    last_login_at: Optional[str] = None
    is_active: bool = True

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role.upper(),
            "created_at": self.created_at,
            "last_login_at": self.last_login_at,
            "is_active": self.is_active,
        }


class AuthRepository:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._init_db()
        self.seed_default_accounts()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL;")
        return conn

    def _init_db(self):
        """Initializes user table with indexed email."""
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
                    hashed_password TEXT NOT NULL,
                    role TEXT NOT NULL DEFAULT 'USER',
                    created_at TEXT NOT NULL,
                    last_login_at TEXT,
                    is_active INTEGER NOT NULL DEFAULT 1
                );
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);")
            conn.commit()

    def seed_default_accounts(self):
        """Seeds standard default developer/admin accounts if they do not already exist."""
        default_admin_email = os.getenv("INITIAL_ADMIN_EMAIL", "admin@smartspace.ai").strip().lower()
        default_admin_password = os.getenv("INITIAL_ADMIN_PASSWORD", "Admin@12345")

        default_research_email = os.getenv("INITIAL_RESEARCH_EMAIL", "research@smartspace.ai").strip().lower()
        default_research_password = os.getenv("INITIAL_RESEARCH_PASSWORD", "Research@SmartSpace2026!")

        default_user_email = os.getenv("INITIAL_USER_EMAIL", "user@smartspace.ai").strip().lower()
        default_user_password = os.getenv("INITIAL_USER_PASSWORD", "User@SmartSpace2026!")

        # Provision/update default Admin
        self.create_or_update_user(
            name="SmartSpace Administrator",
            email=default_admin_email,
            plain_password=default_admin_password,
            role="ADMIN"
        )

        # Provision/update default Research
        self.create_or_update_user(
            name="Prof. Sarah Chen",
            email=default_research_email,
            plain_password=default_research_password,
            role="RESEARCH"
        )

        # Provision/update default Standard User
        self.create_or_update_user(
            name="Alex Vance",
            email=default_user_email,
            plain_password=default_user_password,
            role="USER"
        )

    def create_or_update_user(self, name: str, email: str, plain_password: str, role: str = "USER") -> User:
        """
        Creates a user or resets their password and updates their role.
        """
        cleaned_email = email.strip().lower()
        cleaned_name = name.strip()
        cleaned_role = role.strip().upper()
        if cleaned_role not in ["USER", "ADMIN", "RESEARCH"]:
            cleaned_role = "USER"

        hashed_pwd = hash_password(plain_password)
        now_iso = datetime.datetime.utcnow().isoformat() + "Z"

        existing = self.get_user_by_email(cleaned_email)
        if existing:
            with self._get_connection() as conn:
                conn.execute("""
                    UPDATE users
                    SET name = ?, hashed_password = ?, role = ?, is_active = 1
                    WHERE id = ?
                """, (cleaned_name, hashed_pwd, cleaned_role, existing.id))
                conn.commit()
            return self.get_user_by_id(existing.id)

        user_id = f"usr_{uuid.uuid4().hex[:12]}"
        with self._get_connection() as conn:
            conn.execute("""
                INSERT INTO users (id, name, email, hashed_password, role, created_at, is_active)
                VALUES (?, ?, ?, ?, ?, ?, 1)
            """, (user_id, cleaned_name, cleaned_email, hashed_pwd, cleaned_role, now_iso))
            conn.commit()

        return User(
            id=user_id,
            name=cleaned_name,
            email=cleaned_email,
            hashed_password=hashed_pwd,
            role=cleaned_role,
            created_at=now_iso,
            is_active=True
        )

    def create_or_update_admin(self, name: str, email: str, plain_password: str) -> User:
        return self.create_or_update_user(name, email, plain_password, role="ADMIN")

    def create_user(self, name: str, email: str, plain_password: str, role: str = "USER") -> User:
        """
        Creates a new user record.
        Role is forced to uppercase and validated.
        """
        cleaned_email = email.strip().lower()
        cleaned_name = name.strip()
        cleaned_role = role.strip().upper()

        if cleaned_role not in ["USER", "ADMIN", "RESEARCH"]:
            cleaned_role = "USER"

        if self.get_user_by_email(cleaned_email):
            raise ValueError(f"User with email '{cleaned_email}' already exists.")

        user_id = f"usr_{uuid.uuid4().hex[:12]}"
        hashed_pwd = hash_password(plain_password)
        now_iso = datetime.datetime.utcnow().isoformat() + "Z"

        with self._get_connection() as conn:
            conn.execute("""
                INSERT INTO users (id, name, email, hashed_password, role, created_at, is_active)
                VALUES (?, ?, ?, ?, ?, ?, 1)
            """, (user_id, cleaned_name, cleaned_email, hashed_pwd, cleaned_role, now_iso))
            conn.commit()

        return User(
            id=user_id,
            name=cleaned_name,
            email=cleaned_email,
            hashed_password=hashed_pwd,
            role=cleaned_role,
            created_at=now_iso,
            is_active=True
        )

    def get_user_by_email(self, email: str) -> Optional[User]:
        if not email:
            return None
        cleaned_email = email.strip().lower()
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT * FROM users WHERE email = ?", (cleaned_email,))
            row = cursor.fetchone()
            if row:
                return User(
                    id=row["id"],
                    name=row["name"],
                    email=row["email"],
                    hashed_password=row["hashed_password"],
                    role=row["role"].upper(),
                    created_at=row["created_at"],
                    last_login_at=row["last_login_at"],
                    is_active=bool(row["is_active"])
                )
        return None

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        if not user_id:
            return None
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            if row:
                return User(
                    id=row["id"],
                    name=row["name"],
                    email=row["email"],
                    hashed_password=row["hashed_password"],
                    role=row["role"].upper(),
                    created_at=row["created_at"],
                    last_login_at=row["last_login_at"],
                    is_active=bool(row["is_active"])
                )
        return None

    def update_last_login(self, user_id: str):
        now_iso = datetime.datetime.utcnow().isoformat() + "Z"
        with self._get_connection() as conn:
            conn.execute("UPDATE users SET last_login_at = ? WHERE id = ?", (now_iso, user_id))
            conn.commit()

    def list_users(self) -> List[User]:
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT * FROM users ORDER BY created_at DESC")
            return [
                User(
                    id=row["id"],
                    name=row["name"],
                    email=row["email"],
                    hashed_password=row["hashed_password"],
                    role=row["role"].upper(),
                    created_at=row["created_at"],
                    last_login_at=row["last_login_at"],
                    is_active=bool(row["is_active"])
                )
                for row in cursor.fetchall()
            ]


# Singleton instance
_repo: Optional[AuthRepository] = None


def get_auth_repo() -> AuthRepository:
    global _repo
    if _repo is None:
        _repo = AuthRepository()
    return _repo
