"""add is_active to guests

Revision ID: add_is_active_to_guests
Revises: 001
Create Date: 2024-03-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_is_active_to_guests'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add is_active column to guests table
    op.add_column('guests', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))


def downgrade() -> None:
    # Remove is_active column from guests table
    op.drop_column('guests', 'is_active') 