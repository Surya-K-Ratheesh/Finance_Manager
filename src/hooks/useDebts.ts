import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type Debt = {
  id: string;
  user_id: string;
  person_name: string;
  amount: number;
  type: 'LENT' | 'BORROWED';
  status: 'PENDING' | 'SETTLED';
  due_date: string | null;
  notes: string | null;
  created_at: string;
};

const fetchDebts = async (): Promise<Debt[]> => {
  const res = await fetch('/api/debts');
  if (!res.ok) throw new Error('Failed to fetch debts');
  return res.json();
};

export const useDebts = () => {
  return useQuery({
    queryKey: ['debts'],
    queryFn: fetchDebts,
  });
};

export const useAddDebt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newDebt: Partial<Debt>) => {
      const res = await fetch('/api/debts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDebt),
      });
      if (!res.ok) throw new Error('Failed to add debt');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
  });
};

export const useUpdateDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Debt> & { id: string }) => {
      const res = await fetch('/api/debts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update debt');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
  });
};

export const useDeleteDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/debts?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete debt');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
  });
};
