"""update room types

Revision ID: update_room_types
Revises: add_room_tariffs_table
Create Date: 2024-03-19 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'update_room_types'
down_revision = 'add_room_tariffs_table'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create new enum type with updated values
    op.execute("ALTER TYPE roomtype RENAME TO roomtype_old")
    op.execute("CREATE TYPE roomtype AS ENUM ('GUEST_HOUSE', 'FRAME')")
    
    # Update the column to use the new enum type
    op.execute("ALTER TABLE rooms ALTER COLUMN type TYPE roomtype USING type::text::roomtype")
    
    # Drop the old enum type
    op.execute("DROP TYPE roomtype_old")

def downgrade() -> None:
    # Create old enum type
    op.execute("ALTER TYPE roomtype RENAME TO roomtype_new")
    op.execute("CREATE TYPE roomtype AS ENUM ('STANDARD', 'DELUXE', 'SUITE', 'FAMILY')")
    
    # Update the column to use the old enum type
    op.execute("ALTER TABLE rooms ALTER COLUMN type TYPE roomtype USING type::text::roomtype")
    
    # Drop the new enum type
    op.execute("DROP TYPE roomtype_new") 