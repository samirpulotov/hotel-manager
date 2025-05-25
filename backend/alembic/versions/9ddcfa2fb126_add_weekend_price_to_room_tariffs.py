"""add weekend price to room tariffs

Revision ID: 9ddcfa2fb126
Revises: 5fee332d5580
Create Date: 2024-03-19 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '9ddcfa2fb126'
down_revision = '5fee332d5580'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add weekend_price_per_night column
    op.add_column('room_tariffs', sa.Column('weekend_price_per_night', sa.Float(), nullable=True))

def downgrade() -> None:
    # Remove weekend_price_per_night column
    op.drop_column('room_tariffs', 'weekend_price_per_night') 