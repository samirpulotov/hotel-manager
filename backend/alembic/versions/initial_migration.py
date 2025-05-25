"""initial migration

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Drop existing enum types if they exist
    op.execute('DROP TYPE IF EXISTS room_type CASCADE')
    op.execute('DROP TYPE IF EXISTS booking_status CASCADE')
    
    # Create enum types explicitly
    room_type = postgresql.ENUM('single', 'double', 'suite', 'deluxe', name='room_type', create_type=False)
    booking_status = postgresql.ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', name='booking_status', create_type=False)
    
    # Create the enum types
    room_type.create(op.get_bind())
    booking_status.create(op.get_bind())

    # Create rooms table
    op.create_table(
        'rooms',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('number', sa.String(), nullable=True),
        sa.Column('type', room_type, nullable=True),
        sa.Column('floor', sa.Integer(), nullable=True),
        sa.Column('capacity', sa.Integer(), nullable=True),
        sa.Column('price_per_night', sa.Float(), nullable=True),
        sa.Column('is_available', sa.Boolean(), nullable=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('amenities', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_rooms_number'), 'rooms', ['number'], unique=True)

    # Create guests table
    op.create_table(
        'guests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('first_name', sa.String(), nullable=True),
        sa.Column('last_name', sa.String(), nullable=True),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('address', sa.String(), nullable=True),
        sa.Column('id_type', sa.String(), nullable=True),
        sa.Column('id_number', sa.String(), nullable=True),
        sa.Column('preferences', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_guests_email'), 'guests', ['email'], unique=True)

    # Create bookings table
    op.create_table(
        'bookings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('guest_id', sa.Integer(), nullable=True),
        sa.Column('room_id', sa.Integer(), nullable=True),
        sa.Column('check_in_date', sa.Date(), nullable=True),
        sa.Column('check_out_date', sa.Date(), nullable=True),
        sa.Column('status', booking_status, nullable=True),
        sa.Column('total_price', sa.Float(), nullable=True),
        sa.Column('special_requests', sa.String(), nullable=True),
        sa.Column('payment_status', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['guest_id'], ['guests.id'], ),
        sa.ForeignKeyConstraint(['room_id'], ['rooms.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create employees table
    op.create_table(
        'employees',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('first_name', sa.String(), nullable=True),
        sa.Column('last_name', sa.String(), nullable=True),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('position', sa.String(), nullable=True),
        sa.Column('department', sa.String(), nullable=True),
        sa.Column('hire_date', sa.Date(), nullable=True),
        sa.Column('salary', sa.Float(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_employees_email'), 'employees', ['email'], unique=True)

    # Create financial_transactions table
    op.create_table(
        'financial_transactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('booking_id', sa.Integer(), nullable=True),
        sa.Column('amount', sa.Float(), nullable=True),
        sa.Column('transaction_type', sa.String(), nullable=True),
        sa.Column('category', sa.String(), nullable=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('payment_method', sa.String(), nullable=True),
        sa.Column('transaction_date', sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade() -> None:
    op.drop_table('financial_transactions')
    op.drop_index(op.f('ix_employees_email'), table_name='employees')
    op.drop_table('employees')
    op.drop_table('bookings')
    op.drop_index(op.f('ix_guests_email'), table_name='guests')
    op.drop_table('guests')
    op.drop_index(op.f('ix_rooms_number'), table_name='rooms')
    op.drop_table('rooms')
    op.execute('DROP TYPE IF EXISTS booking_status')
    op.execute('DROP TYPE IF EXISTS room_type') 