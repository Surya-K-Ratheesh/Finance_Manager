'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAddTransaction } from '@/hooks/useTransactions';
import { X } from 'lucide-react';

const formSchema = z.object({
  description: z.string().min(2, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(2, "Category is required"),
  date: z.string(),
  payment_method: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function TransactionModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void 
}) {
  const addMutation = useAddTransaction();
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: 'EXPENSE',
      category: 'Food',
    }
  });

  const onSubmit = async (data: any) => {
    await addMutation.mutateAsync(data);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold">Add Transaction</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
              <select {...register('type')} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-transparent">
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
              <input type="date" {...register('date')} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-transparent" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <input type="text" {...register('description')} placeholder="e.g. Grocery" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-transparent" />
            {errors.description && <p className="text-rose-500 text-xs">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
              <input type="number" step="0.01" {...register('amount')} placeholder="0.00" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-transparent" />
              {errors.amount && <p className="text-rose-500 text-xs">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
              <input type="text" {...register('category')} placeholder="e.g. Food" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-transparent" />
              {errors.category && <p className="text-rose-500 text-xs">{errors.category.message}</p>}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
