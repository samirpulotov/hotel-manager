"""update timestamps

Revision ID: update_timestamps
Revises: final_merge
Create Date: 2024-03-19

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'update_timestamps'
down_revision = 'final_merge'
branch_labels = None
depends_on = None

def upgrade():
    # First, update any NULL values
    op.execute("""
        UPDATE rooms 
        SET created_at = CURRENT_TIMESTAMP, 
            updated_at = CURRENT_TIMESTAMP 
        WHERE created_at IS NULL OR updated_at IS NULL
    """)

    # Then make columns non-nullable and set default values
    op.alter_column('rooms', 'created_at',
        existing_type=sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.text('CURRENT_TIMESTAMP')
    )
    op.alter_column('rooms', 'updated_at',
        existing_type=sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.text('CURRENT_TIMESTAMP')
    )

def downgrade():
    # Make columns nullable again
    op.alter_column('rooms', 'created_at',
        existing_type=sa.DateTime(timezone=True),
        nullable=True,
        server_default=None
    )
    op.alter_column('rooms', 'updated_at',
        existing_type=sa.DateTime(timezone=True),
        nullable=True,
        server_default=None
    ) 