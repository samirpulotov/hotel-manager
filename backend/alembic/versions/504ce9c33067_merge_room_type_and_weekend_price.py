"""merge room type and weekend price

Revision ID: 504ce9c33067
Revises: 3931a93a7a69, 9ddcfa2fb126
Create Date: 2024-03-19

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '504ce9c33067'
down_revision = ('3931a93a7a69', '9ddcfa2fb126')
branch_labels = None
depends_on = None

def upgrade():
    pass

def downgrade():
    pass 