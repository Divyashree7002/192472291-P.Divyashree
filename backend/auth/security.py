"""
SmartSpace AI - Cryptographic Security & JWT Token Management
Provides PBKDF2 password hashing and HS256 JWT token generation / verification.
"""

import os
import hmac
import hashlib
import base64
import json
import time
import secrets
from typing import Optional, Dict, Any, Tuple

# Secret key for token signing (can be overridden via environment variable)
SECRET_KEY = os.getenv("SMARTSPACE_JWT_SECRET", "smartspace-ai-sec-key-2026-prod-auth-token-hashing-sign")
ALGORITHM = "HS256"
DEFAULT_TOKEN_EXPIRE_SECONDS = 86400 * 7  # 7 days


def _b64_encode(data: bytes) -> str:
    """URL-safe base64 encoding without trailing padding."""
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')


def _b64_decode(data: str) -> bytes:
    """URL-safe base64 decoding with padding restoration."""
    padding = '=' * (4 - (len(data) % 4)) if len(data) % 4 != 0 else ''
    return base64.urlsafe_b64decode((data + padding).encode('utf-8'))


def hash_password(password: str) -> str:
    """
    Hashes a password using PBKDF2-HMAC-SHA256 with 100,000 iterations.
    Format: pbkdf2_sha256$100000$salt_hex$hash_hex
    """
    if not password:
        raise ValueError("Password cannot be empty.")
    
    salt = secrets.token_hex(16)
    iterations = 100000
    derived_key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        iterations,
        dklen=32
    )
    return f"pbkdf2_sha256${iterations}${salt}${derived_key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against a PBKDF2 hashed password string using constant-time comparison.
    """
    if not plain_password or not hashed_password:
        return False

    try:
        parts = hashed_password.split('$')
        if len(parts) != 4 or parts[0] != 'pbkdf2_sha256':
            return False

        iterations = int(parts[1])
        salt = parts[2]
        expected_hash = parts[3]

        derived_key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            iterations,
            dklen=32
        )
        return secrets.compare_digest(derived_key.hex(), expected_hash)
    except Exception:
        return False


def create_access_token(payload: Dict[str, Any], expires_delta_seconds: int = DEFAULT_TOKEN_EXPIRE_SECONDS) -> str:
    """
    Creates a standard HS256 JWT token with expiry and signature.
    """
    header = {
        "typ": "JWT",
        "alg": ALGORITHM
    }
    
    now = int(time.time())
    token_payload = {
        **payload,
        "iat": now,
        "exp": now + expires_delta_seconds
    }

    header_bytes = json.dumps(header, separators=(',', ':')).encode('utf-8')
    payload_bytes = json.dumps(token_payload, separators=(',', ':')).encode('utf-8')

    encoded_header = _b64_encode(header_bytes)
    encoded_payload = _b64_encode(payload_bytes)

    signing_input = f"{encoded_header}.{encoded_payload}".encode('utf-8')
    signature = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    encoded_signature = _b64_encode(signature)

    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and verifies an HS256 JWT token. Returns payload dict or None if invalid/expired.
    """
    if not token or not isinstance(token, str):
        return None

    parts = token.split('.')
    if len(parts) != 3:
        return None

    encoded_header, encoded_payload, encoded_signature = parts

    try:
        signing_input = f"{encoded_header}.{encoded_payload}".encode('utf-8')
        expected_signature = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
        provided_signature = _b64_decode(encoded_signature)

        if not secrets.compare_digest(expected_signature, provided_signature):
            return None

        payload_bytes = _b64_decode(encoded_payload)
        payload = json.loads(payload_bytes.decode('utf-8'))

        # Check expiration
        exp = payload.get("exp")
        if exp is not None and time.time() > exp:
            return None

        return payload
    except Exception:
        return None
