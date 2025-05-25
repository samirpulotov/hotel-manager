"""update room type enum values

Revision ID: 3c53388de027
Revises: add_room_tariffs_table
Create Date: 2024-03-19

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '3c53388de027'
down_revision = 'add_room_tariffs_table'
branch_labels = None
depends_on = None

def upgrade():
    # Create new enum type
    op.execute("CREATE TYPE roomtype_new AS ENUM ('STANDARD', 'DELUXE', 'SUITE', 'FAMILY')")
    
    # Update existing values
    op.execute("ALTER TABLE rooms ALTER COLUMN type TYPE roomtype_new USING type::text::roomtype_new")
    
    # Drop old enum type
    op.execute("DROP TYPE roomtype")
    
    # Rename new enum type
    op.execute("ALTER TYPE roomtype_new RENAME TO roomtype")

def downgrade():
    # Create old enum type
    op.execute("CREATE TYPE roomtype_old AS ENUM ('standard', 'deluxe', 'suite', 'family')")
    
    # Update existing values
    op.execute("ALTER TABLE rooms ALTER COLUMN type TYPE roomtype_old USING type::text::roomtype_old")
    
    # Drop new enum type
    op.execute("DROP TYPE roomtype")
    
    # Rename old enum type
    op.execute("ALTER TYPE roomtype_old RENAME TO roomtype") 