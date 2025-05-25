export interface RoomTariff {
  id: number;
  room_type: string;
  price_per_night: number;
  weekend_price_per_night: number | null;
  min_nights: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface TariffCreate {
  room_type: string;
  price_per_night: number;
  weekend_price_per_night?: number | null;
  min_nights: number;
  start_date: string;
  end_date: string;
}

export interface TariffUpdate {
  price_per_night?: number;
  weekend_price_per_night?: number | null;
  min_nights?: number;
  start_date?: string;
  end_date?: string;
} 