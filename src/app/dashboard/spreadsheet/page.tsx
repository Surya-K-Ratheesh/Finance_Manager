'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Save, Trash2, Table as TableIcon, Calendar } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';

type RowData = {
  id: string; // temporary UI id
  date: string;
  description: string;
  amount: string;
  category: string;
  type: 'EXPENSE' | 'INCOME';
  payment_method: string;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export default function SpreadsheetPage() {
  const queryClient = useQueryClient();
  const { data: transactions, isLoading } = useTransactions();
  
  const [isSaving, setIsSaving] = useState(false);
  const [needsReset, setNeedsReset] = useState(true);

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [rows, setRows] = useState<RowData[]>([]);

  useEffect(() => {
    if (transactions && needsReset) {
      // Filter transactions for specific month/year
      const filteredRows = transactions.filter((t: any) => {
        const d = new Date(t.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      }).map((t: any) => ({
        id: t.id,
        date: t.date,
        description: t.description,
        amount: String(t.amount),
        category: t.category,
        type: t.type,
        payment_method: t.payment_method || ''
      })).sort((a: RowData, b: RowData) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const isCurrent = selectedMonth === currentDate.getMonth() && selectedYear === currentDate.getFullYear();
      
      const yyyy = selectedYear;
      const mm = String(selectedMonth + 1).padStart(2, '0');
      const defaultDate = `${yyyy}-${mm}-01`;
      
      const fallbackDate = isCurrent ? currentDate.toISOString().split('T')[0] : defaultDate;

      const emptyRows = Array.from({ length: 5 }).map(() => ({
        id: crypto.randomUUID(),
        date: fallbackDate,
        description: '',
        amount: '',
        category: '',
        type: 'EXPENSE' as const,
        payment_method: '',
      }));

      setRows([...filteredRows, ...emptyRows]);
      setNeedsReset(false);
    }
  }, [transactions, needsReset, selectedMonth, selectedYear]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(Number(e.target.value));
    setNeedsReset(true);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(e.target.value));
    setNeedsReset(true);
  };

  const addRow = () => {
    const isCurrent = selectedMonth === currentDate.getMonth() && selectedYear === currentDate.getFullYear();
    const fallbackDate = isCurrent ? new Date().toISOString().split('T')[0] : `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;

    setRows([...rows, {
      id: crypto.randomUUID(),
      date: fallbackDate,
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
    const validRows = rows.filter(r => r.description.trim() !== '' && r.amount !== '' && !isNaN(Number(r.amount)));
    if (validRows.length === 0) return;

    setIsSaving(true);
    try {
      const formattedData = validRows.map(r => ({
        id: r.id, 
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

      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setNeedsReset(true); 
      
      alert(`Success! Saved ${validRows.length} transactions to the ledger.`);
    } catch (e) {
      console.error(e);
      alert('Failed to save transactions.');
    } finally {
      setIsSaving(false);
    }
  };

  const yearsOptions = Array.from({ length: 5 }).map((_, i) => currentDate.getFullYear() - 2 + i);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
           <div className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 p-2 rounded-lg">
             <TableIcon size={24} />
           </div>
           Spreadsheet
        </h1>
        
        {/* Date Selector */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 shadow-sm">
           <Calendar size={18} className="text-slate-400 ml-2" />
           <select 
              value={selectedMonth} 
              onChange={handleMonthChange}
              className="bg-transparent border-none outline-none font-medium text-slate-700 dark:text-slate-300 pr-2 cursor-pointer focus:ring-0"
           >
             {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
           </select>
           <div className="w-px h-5 bg-slate-200 dark:bg-slate-700"></div>
           <select 
              value={selectedYear} 
              onChange={handleYearChange}
              className="bg-transparent border-none outline-none font-medium text-slate-700 dark:text-slate-300 pr-2 cursor-pointer focus:ring-0"
           >
             {yearsOptions.map(y => <option key={y} value={y}>{y}</option>)}
           </select>
        </div>

        <div className="space-x-3 flex items-center">
          <button onClick={addRow} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 shadow-sm">
             <Plus size={18}/> Row
          </button>
          <button onClick={saveAll} disabled={isSaving || rows.length===0} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-md font-medium flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm">
            <Save size={18} /> {isSaving ? 'Saving...' : 'Save Data'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
             <div className="p-12 text-center text-slate-500">Loading your ledger...</div>
          ) : (
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
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800 group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-1">
                      <input type="date" value={row.date} onChange={e => updateRow(row.id, 'date', e.target.value)} className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 dark:hover:border-slate-600 rounded px-2 py-1.5 outline-none transition-colors text-slate-700 dark:text-slate-300" />
                    </td>
                    <td className="p-1">
                      <select value={row.type} onChange={e => updateRow(row.id, 'type', e.target.value as any)} className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 dark:hover:border-slate-600 rounded px-2 py-1.5 outline-none appearance-none cursor-pointer transition-colors text-slate-700 dark:text-slate-300">
                        <option value="EXPENSE">Expense</option>
                        <option value="INCOME">Income</option>
                      </select>
                    </td>
                    <td className="p-1">
                      <input type="text" placeholder="e.g. Groceries" value={row.description} onChange={e => updateRow(row.id, 'description', e.target.value)} className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 dark:hover:border-slate-600 rounded px-2 py-1.5 outline-none transition-colors text-slate-700 dark:text-slate-300" />
                    </td>
                    <td className="p-1">
                      <input type="text" placeholder="e.g. Food" value={row.category} onChange={e => updateRow(row.id, 'category', e.target.value)} className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 dark:hover:border-slate-600 rounded px-2 py-1.5 outline-none transition-colors text-slate-700 dark:text-slate-300" />
                    </td>
                    <td className="p-1">
                      <div className="relative flex items-center">
                         <span className="absolute left-2 text-slate-400">$</span>
                         <input type="number" step="0.01" placeholder="0.00" value={row.amount} onChange={e => updateRow(row.id, 'amount', e.target.value)} className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 dark:hover:border-slate-600 rounded pl-6 pr-2 py-1.5 outline-none transition-colors text-slate-700 dark:text-slate-300" />
                      </div>
                    </td>
                    <td className="p-1 text-center">
                      <button onClick={() => removeRow(row.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-slate-500">
                      No rows to display. Click "Row" to add entries.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-slate-500 text-xs flex items-center justify-between bg-slate-50 dark:bg-slate-800/20">
             <span>Typing in a row makes it valid. Empty rows are silently ignored. Data is isolated to {MONTHS[selectedMonth]} {selectedYear}.</span>
             <span>{rows.length} Rows Rendered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
