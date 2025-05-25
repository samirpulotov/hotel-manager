export type RoomType = 'GUEST_HOUSE' | 'FRAME';

export interface Room {
  id: number;
  number: string;
  type: RoomType;
  floor: number;
  capacity: number;
  price_per_night: number;
  is_available: boolean;
  description?: string;
  amenities?: string;
  created_at: string;
  updated_at: string;
}

export interface RoomCreate {
  number: string;
  type: RoomType;
  floor: number;
  capacity: number;
  price_per_night: number;
  description?: string;
  amenities?: string;
}

export interface RoomUpdate extends Partial<RoomCreate> {
  is_available?: boolean;
} 