"""add room_tariffs table

Revision ID: add_room_tariffs_table
Revises: ffbd4cf35c9b
Create Date: 2024-03-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'add_room_tariffs_table'
down_revision = 'ffbd4cf35c9b'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'room_tariffs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('room_type', sa.String(), nullable=False),
        sa.Column('price_per_night', sa.Float(), nullable=False),
        sa.Column('min_nights', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime(), nullable=True, default=datetime.utcnow, onupdate=datetime.utcnow),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade() -> None:
    op.drop_table('room_tariffs') 