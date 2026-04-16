import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type Transaction = {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  payment_method: string | null;
  date: string;
  created_at: string;
};

const fetchTransactions = async (): Promise<Transaction[]> => {
  const res = await fetch('/api/transactions');
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
};

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });
};

export const useAddTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newTransaction: Partial<Transaction>) => {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction),
      });
      if (!res.ok) throw new Error('Failed to add transaction');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/transactions?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete transaction');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
