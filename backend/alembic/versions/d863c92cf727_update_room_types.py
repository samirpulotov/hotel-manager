"""update room types

Revision ID: d863c92cf727
Revises: add_room_tariffs_table
Create Date: 2024-03-19 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'd863c92cf727'
down_revision = 'add_room_tariffs_table'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Delete all rows from dependent tables first
    op.execute("DELETE FROM bookings")
    op.execute("DELETE FROM room_tariffs")
    op.execute("DELETE FROM financial_transactions")
    op.execute("DELETE FROM rooms")
    
    # Convert the column to text first
    op.execute("ALTER TABLE rooms ALTER COLUMN type TYPE text")
    
    # Drop the old enum type and create the new one
    op.execute("DROP TYPE IF EXISTS roomtype CASCADE")
    op.execute("CREATE TYPE roomtype AS ENUM ('GUEST_HOUSE', 'FRAME')")
    
    # Convert the column back to the new enum type
    op.execute("ALTER TABLE rooms ALTER COLUMN type TYPE roomtype USING type::roomtype")

def downgrade() -> None:
    # Convert the column to text first
    op.execute("ALTER TABLE rooms ALTER COLUMN type TYPE text")
    
    # Drop the new enum type and recreate the old one
    op.execute("DROP TYPE IF EXISTS roomtype CASCADE")
    op.execute("CREATE TYPE roomtype AS ENUM ('STANDARD', 'DELUXE', 'SUITE', 'FAMILY')")
    
    # Convert the column back to the old enum type
    op.execute("ALTER TABLE rooms ALTER COLUMN type TYPE roomtype USING type::roomtype") 