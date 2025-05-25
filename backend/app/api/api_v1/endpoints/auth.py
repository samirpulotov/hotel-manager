from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import logging
from jose import jwt, JWTError

from app.api import deps
from app.core import security
from app.core.config import settings
from app.schemas.user import User, UserCreate, Token
from app.models.user import User as UserModel

router = APIRouter()

logger = logging.getLogger(__name__)

@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    logger.info(f"Login attempt for user: {form_data.username}")
    user = deps.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        logger.warning(f"Login failed for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.is_active:
        logger.warning(f"Inactive user attempted login: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    logger.info(f"Login successful for user: {form_data.username}")
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/refresh", response_model=Token)
def refresh_token(
    db: Session = Depends(deps.get_db),
    authorization: str = Header(None),
) -> Any:
    """
    Refresh the access token
    """
    if not authorization or not authorization.startswith("Bearer "):
        logger.warning("Token refresh failed: No Bearer token provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split(" ")[1]
    try:
        # Decode the token without validation
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
        
        # Extract user ID from token
        user_id = payload.get("sub")
        if not user_id:
            logger.warning("Token refresh failed: No user ID in token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
        
        # Get the user from database
        user = db.query(UserModel).filter(UserModel.id == user_id).first()
        if not user:
            logger.warning(f"Token refresh failed: User {user_id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        if not user.is_active:
            logger.warning(f"Token refresh failed: User {user_id} is inactive")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user",
            )
        
        # Create new token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        new_token = security.create_access_token(
            user.id, expires_delta=access_token_expires
        )
        
        logger.info(f"Token refreshed successfully for user {user_id}")
        return {
            "access_token": new_token,
            "token_type": "bearer",
        }
    except JWTError as e:
        logger.error(f"Token refresh failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

@router.post("/register", response_model=User)
def register(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    user = db.query(UserModel).filter(UserModel.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = UserModel(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        is_superuser=user_in.is_superuser,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user 