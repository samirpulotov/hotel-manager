"""update foreign keys

Revision ID: update_foreign_keys
Revises: update_timestamps
Create Date: 2024-03-19

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'update_foreign_keys'
down_revision = 'update_timestamps'
branch_labels = None
depends_on = None

def upgrade():
    # Drop existing foreign key constraints
    op.drop_constraint('financial_transactions_booking_id_fkey', 'financial_transactions', type_='foreignkey')
    op.drop_constraint('bookings_guest_id_fkey', 'bookings', type_='foreignkey')
    op.drop_constraint('bookings_room_id_fkey', 'bookings', type_='foreignkey')
    op.drop_constraint('room_tariffs_room_id_fkey', 'room_tariffs', type_='foreignkey')

    # Recreate foreign key constraints with ON DELETE CASCADE
    op.create_foreign_key(
        'financial_transactions_booking_id_fkey',
        'financial_transactions', 'bookings',
        ['booking_id'], ['id'],
        ondelete='CASCADE'
    )
    op.create_foreign_key(
        'bookings_guest_id_fkey',
        'bookings', 'guests',
        ['guest_id'], ['id'],
        ondelete='CASCADE'
    )
    op.create_foreign_key(
        'bookings_room_id_fkey',
        'bookings', 'rooms',
        ['room_id'], ['id'],
        ondelete='CASCADE'
    )
    op.create_foreign_key(
        'room_tariffs_room_id_fkey',
        'room_tariffs', 'rooms',
        ['room_id'], ['id'],
        ondelete='CASCADE'
    )

def downgrade():
    # Drop cascade foreign key constraints
    op.drop_constraint('financial_transactions_booking_id_fkey', 'financial_transactions', type_='foreignkey')
    op.drop_constraint('bookings_guest_id_fkey', 'bookings', type_='foreignkey')
    op.drop_constraint('bookings_room_id_fkey', 'bookings', type_='foreignkey')
    op.drop_constraint('room_tariffs_room_id_fkey', 'room_tariffs', type_='foreignkey')

    # Recreate original foreign key constraints
    op.create_foreign_key(
        'financial_transactions_booking_id_fkey',
        'financial_transactions', 'bookings',
        ['booking_id'], ['id']
    )
    op.create_foreign_key(
        'bookings_guest_id_fkey',
        'bookings', 'guests',
        ['guest_id'], ['id']
    )
    op.create_foreign_key(
        'bookings_room_id_fkey',
        'bookings', 'rooms',
        ['room_id'], ['id']
    )
    op.create_foreign_key(
        'room_tariffs_room_id_fkey',
        'room_tariffs', 'rooms',
        ['room_id'], ['id']
    ) 