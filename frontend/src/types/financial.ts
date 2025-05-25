export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer';

export interface FinancialTransaction {
  id: number;
  amount: number;
  transaction_type: 'income' | 'expense';
  category: string;
  description: string;
  payment_method: 'cash' | 'card' | 'bank_transfer';
  transaction_date: string;
}

export interface TransactionCreate {
  amount: number;
  transaction_type: 'income' | 'expense';
  category: string;
  description: string;
  payment_method: 'cash' | 'card' | 'bank_transfer';
  transaction_date: string;
}

export interface TransactionUpdate extends Partial<TransactionCreate> {} 