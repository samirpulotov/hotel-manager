"""add room_type to rooms

Revision ID: f1db1c5d62b2
Revises: fa23633d9de9
Create Date: 2025-05-24 21:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f1db1c5d62b2'
down_revision = 'fa23633d9de9'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('rooms', sa.Column('room_type', sa.String(), nullable=False, server_default="STANDARD"))


def downgrade():
    op.drop_column('rooms', 'room_type') 