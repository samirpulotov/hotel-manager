import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def create_admin(email: str, password: str, is_superuser: bool = True) -> None:
    db = SessionLocal()
    try:
        # Check if user already exists
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f"User {email} already exists")
            return

        # Create new admin user
        user = User(
            email=email,
            hashed_password=get_password_hash(password),
            is_superuser=is_superuser,
            is_active=True
        )
        db.add(user)
        db.commit()
        print(f"Created admin user: {email}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python create_admin.py <email> <password>")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    create_admin(email, password) 