"""
SmartSpace AI - Admin Account Provisioning CLI Script
Usage:
    python create_admin.py
    python create_admin.py --email admin@smartspace.ai --password Admin@12345 --name "SmartSpace Administrator"
"""

import sys
import os
import argparse

# Add parent and current directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from auth.storage import get_auth_repo


def main():
    parser = argparse.ArgumentParser(description="Create or reset SmartSpace AI Administrator Account")
    parser.add_argument("--name", default="SmartSpace Administrator", help="Admin user full name")
    parser.add_argument("--email", default="admin@smartspace.ai", help="Admin email address")
    parser.add_argument("--password", default="Admin@12345", help="Admin password")

    args = parser.parse_args()

    repo = get_auth_repo()
    user = repo.create_or_update_admin(
        name=args.name,
        email=args.email,
        plain_password=args.password
    )

    print("=" * 60)
    print(" SmartSpace AI - Admin Account Provisioned Successfully")
    print("=" * 60)
    print(f" ID:       {user.id}")
    print(f" Name:     {user.name}")
    print(f" Email:    {user.email}")
    print(f" Role:     {user.role} (Verified)")
    print(f" Status:   Active ({'Enabled' if user.is_active else 'Disabled'})")
    print("=" * 60)
    print("You can now log in at: http://localhost:5173/login")
    print(f"Credentials -> Email: {user.email} | Password: {args.password}")
    print("=" * 60)


if __name__ == "__main__":
    main()
