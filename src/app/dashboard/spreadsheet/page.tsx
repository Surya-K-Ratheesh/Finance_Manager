'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Save, Trash2, Table as TableIcon } from 'lucide-react';

type RowData = {
  id: string; // temporary UI id
  date: string;
  description: string;
  amount: string;
  category: string;
  type: 'EXPENSE' | 'INCOME';
  payment_method: string;
};

export default function SpreadsheetPage() {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [rows, setRows] = useState<RowData[]>(
    Array.from({ length: 15 }).map(() => ({
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      category: '',
      type: 'EXPENSE',
      payment_method: '',
    }))
  );

  const addRow = () => {
    setRows([...rows, {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      category: '',
      type: 'EXPENSE',
      payment_method: '',
    }]);
  };

  const removeRow = (id: string) => {
    setRows(rows.filter(r => r.id !== id));
  };

  const updateRow = (id: string, field: keyof RowData, value: string) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const saveAll = async () => {
    // Filter valid rows
    const validRows = rows.filter(r => r.description.trim() !== '' && r.amount !== '' && !isNaN(Number(r.amount)));
    if (validRows.length === 0) return;

    setIsSaving(true);
    try {
      const formattedData = validRows.map(r => ({
        date: r.date,
        description: r.description,
        amount: Number(r.amount),
        category: r.category,
        type: r.type,
        payment_method: r.payment_method
      }));

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      });

      if (!res.ok) throw new Error('Failed to bulk save');

      // Refresh cache
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      
      // Reset form to empty rows
      setRows(
        Array.from({ length: 15 }).map(() => ({
          id: crypto.randomUUID(),
          date: new Date().toISOString().split('T')[0],
          description: '',
          amount: '',
          category: '',
          type: 'EXPENSE',
          payment_method: '',
        }))
      );
      
      // We don't have to navigate away, the user can just see success inline or via alert
      alert(`Success! Bulk-saved ${validRows.length} transactions to the ledger.`);
    } catch (e) {
      console.error(e);
      alert('Failed to save transactions.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
           <div className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 p-2 rounded-lg">
             <TableIcon size={24} />
           </div>
           Spreadsheet Entry
        </h1>
        <div className="space-x-3 flex items-center">
          <button onClick={addRow} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2">
             <Plus size={18}/> Row
          </button>
          <button onClick={saveAll} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-md font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            <Save size={18} /> {isSaving ? 'Saving...' : 'Save Data'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 font-medium w-36">Date</th>
                <th className="px-4 py-3 font-medium w-32">Type</th>
                <th className="px-4 py-3 font-medium flex-1">Description</th>
                <th className="px-4 py-3 font-medium w-48">Category</th>
                <th className="px-4 py-3 font-medium w-36">Amount</th>
                <th className="px-4 py-3 font-medium w-12 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800 group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-1">
                    <input type="date" value={row.date} onChange={e => updateRow(row.id, 'date', e.target.value)} className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 dark:hover:border-slate-600 rounded px-2 py-1.5 outline-none transition-colors" />
                  </td>
                  <td className="p-1">
                    <select value={row.type} onChange={e => updateRow(row.id, 'type', e.target.value as any)} className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 dark:hover:border-slate-600 rounded px-2 py-1.5 outline-none appearance-none cursor-pointer transition-colors">
                      <option value="EXPENSE">Expense</option>
                      <option value="INCOME">Income</option>
                    </select>
                  </td>
                  <td className="p-1">
                    <input type="text" placeholder="e.g. Groceries" value={row.description} onChange={e => updateRow(row.id, 'description', e.target.value)} className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 dark:hover:border-slate-600 rounded px-2 py-1.5 outline-none transition-colors" />
                  </td>
                  <td className="p-1">
                    <input type="text" placeholder="e.g. Food" value={row.category} onChange={e => updateRow(row.id, 'category', e.target.value)} className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 dark:hover:border-slate-600 rounded px-2 py-1.5 outline-none transition-colors" />
                  </td>
                  <td className="p-1">
                    <div className="relative flex items-center">
                       <span className="absolute left-2 text-slate-400">$</span>
                       <input type="number" step="0.01" placeholder="0.00" value={row.amount} onChange={e => updateRow(row.id, 'amount', e.target.value)} className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 dark:hover:border-slate-600 rounded pl-6 pr-2 py-1.5 outline-none transition-colors" />
                    </div>
                  </td>
                  <td className="p-1 text-center">
                    <button onClick={() => removeRow(row.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-slate-500 text-xs flex items-center justify-between">
             <span>Typing in a row makes it valid. Empty rows are simply ignored when saving.</span>
             <span>{rows.length} Rows Rendered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
