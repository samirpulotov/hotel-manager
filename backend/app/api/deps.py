from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session
import logging

from app.core.config import settings
from app.core.security import verify_password
from app.db.session import SessionLocal
from app.models.user import User
from app.schemas.user import TokenPayload

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

logger = logging.getLogger(__name__)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    try:
        # Decode token without expiration check
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM],
            options={
                "verify_exp": False,  # Don't verify expiration
                "verify_iat": False,  # Don't verify issued at
                "verify_nbf": False,  # Don't verify not before
            }
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError) as e:
        logger.error(f"Token validation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.id == token_data.sub).first()
    if not user:
        logger.warning(f"User not found for token sub: {token_data.sub}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User not found"
        )
    return user

def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        logger.warning(f"Inactive user attempted access: {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    return current_user

def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_superuser:
        logger.warning(f"Non-superuser attempted superuser access: {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="The user doesn't have enough privileges"
        )
    return current_user

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    logger.info(f"Authenticating user: {email}")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        logger.warning(f"User not found: {email}")
        return None
    if not verify_password(password, user.hashed_password):
        logger.warning(f"Invalid password for user: {email}")
        return None
    logger.info(f"User authenticated successfully: {email}")
    return user 