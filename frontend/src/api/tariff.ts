import client from './client';
import type { RoomTariff, TariffCreate, TariffUpdate } from '../types/tariff';

export const tariffApi = {
  getTariffs: async (roomType?: string): Promise<RoomTariff[]> => {
    const params = roomType ? { room_type: roomType } : {};
    const response = await client.get('/tariffs', { params });
    return response.data;
  },

  getCurrentTariff: async (roomType: string, date?: string): Promise<RoomTariff> => {
    const params: { room_type: string; date?: string } = { room_type: roomType };
    if (date) {
      params.date = date;
    }
    const response = await client.get('/tariffs/current', { params });
    return response.data;
  },

  createTariff: async (data: TariffCreate): Promise<RoomTariff> => {
    const response = await client.post('/tariffs', data);
    return response.data;
  },

  updateTariff: async (id: number, data: TariffUpdate): Promise<RoomTariff> => {
    const response = await client.put(`/tariffs/${id}`, data);
    return response.data;
  },

  deleteTariff: async (id: number): Promise<RoomTariff> => {
    const response = await client.delete(`/tariffs/${id}`);
    return response.data;
  },
}; 