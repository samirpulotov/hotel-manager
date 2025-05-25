import client from './client';
import type { FinancialTransaction, TransactionCreate } from '../types/financial';

export const financialApi = {
  getTransactions: async (): Promise<FinancialTransaction[]> => {
    const response = await client.get('/financial');
    return response.data;
  },

  createTransaction: async (data: TransactionCreate): Promise<FinancialTransaction> => {
    const response = await client.post('/financial', data);
    return response.data;
  },

  updateTransaction: async (id: number, transaction: Partial<TransactionCreate>) => {
    const response = await client.put(`/financial/${id}`, transaction);
    return response.data;
  },

  deleteTransaction: async (id: number) => {
    const response = await client.delete(`/financial/${id}`);
    return response.data;
  },

  getTransaction: async (id: number) => {
    const response = await client.get(`/financial/${id}`);
    return response.data;
  },
}; 