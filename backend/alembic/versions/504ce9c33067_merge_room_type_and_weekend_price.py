"""update room type enum and add room_id foreign key

Revision ID: 504ce9c33067
Revises: 9ddcfa2fb126
Create Date: 2024-03-19

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '504ce9c33067'
down_revision = '9ddcfa2fb126'
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

    # Add room_id column to room_tariffs
    op.add_column('room_tariffs', sa.Column('room_id', sa.Integer(), nullable=True))
    
    # Add foreign key constraint
    op.create_foreign_key(
        'fk_room_tariffs_room_id',
        'room_tariffs', 'rooms',
        ['room_id'], ['id']
    )

def downgrade():
    # Drop foreign key constraint
    op.drop_constraint('fk_room_tariffs_room_id', 'room_tariffs', type_='foreignkey')
    
    # Drop room_id column
    op.drop_column('room_tariffs', 'room_id')

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