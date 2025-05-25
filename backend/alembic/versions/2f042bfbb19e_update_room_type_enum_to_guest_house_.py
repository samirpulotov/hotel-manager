"""update room type enum to guest house and frame

Revision ID: 2f042bfbb19e
Revises: 3c53388de027
Create Date: 2024-03-19

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '2f042bfbb19e'
down_revision = '3c53388de027'
branch_labels = None
depends_on = None

def upgrade():
    # Create new enum type
    op.execute("CREATE TYPE roomtype_new AS ENUM ('GUEST_HOUSE', 'FRAME')")
    
    # Update existing values
    op.execute("""
        ALTER TABLE rooms 
        ALTER COLUMN type TYPE roomtype_new 
        USING CASE 
            WHEN type::text IN ('STANDARD', 'DELUXE') THEN 'FRAME'::roomtype_new
            WHEN type::text IN ('SUITE', 'FAMILY') THEN 'GUEST_HOUSE'::roomtype_new
            ELSE 'FRAME'::roomtype_new
        END
    """)
    
    # Drop old enum type
    op.execute("DROP TYPE roomtype")
    
    # Rename new enum type
    op.execute("ALTER TYPE roomtype_new RENAME TO roomtype")

def downgrade():
    # Create old enum type
    op.execute("CREATE TYPE roomtype_old AS ENUM ('STANDARD', 'DELUXE', 'SUITE', 'FAMILY')")
    
    # Update existing values
    op.execute("""
        ALTER TABLE rooms 
        ALTER COLUMN type TYPE roomtype_old 
        USING CASE 
            WHEN type::text = 'FRAME' THEN 'STANDARD'::roomtype_old
            WHEN type::text = 'GUEST_HOUSE' THEN 'SUITE'::roomtype_old
            ELSE 'STANDARD'::roomtype_old
        END
    """)
    
    # Drop new enum type
    op.execute("DROP TYPE roomtype")
    
    # Rename old enum type
    op.execute("ALTER TYPE roomtype_old RENAME TO roomtype") 