"""add min_nights to room_tariffs

Revision ID: 9b1194259f80
Revises: f1db1c5d62b2
Create Date: 2025-05-24 21:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9b1194259f80'
down_revision = 'f1db1c5d62b2'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('room_tariffs', sa.Column('min_nights', sa.Integer(), nullable=False, server_default='1'))


def downgrade():
    op.drop_column('room_tariffs', 'min_nights') 