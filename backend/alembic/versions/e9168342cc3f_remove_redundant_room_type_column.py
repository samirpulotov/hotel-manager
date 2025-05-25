"""remove redundant room_type column

Revision ID: e9168342cc3f
Revises: d863c92cf727
Create Date: 2024-03-19 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'e9168342cc3f'
down_revision = 'd863c92cf727'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Check if the column exists before trying to drop it
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('rooms')]
    
    if 'room_type' in columns:
        op.drop_column('rooms', 'room_type')

def downgrade() -> None:
    # Add back the room_type column
    op.add_column('rooms', sa.Column('room_type', sa.String(), nullable=False)) 
