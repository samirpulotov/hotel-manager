"""merge heads

Revision ID: 5fee332d5580
Revises: 9b1194259f80, update_room_types, e9168342cc3f
Create Date: 2024-03-19 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '5fee332d5580'
down_revision = ('9b1194259f80', 'update_room_types', 'e9168342cc3f')
branch_labels = None
depends_on = None

def upgrade() -> None:
    pass

def downgrade() -> None:
    pass 