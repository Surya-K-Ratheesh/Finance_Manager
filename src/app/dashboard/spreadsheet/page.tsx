'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Save, Trash2, Table as TableIcon, Calendar, ArrowUpDown, ChevronUp, ChevronDown, Search, Filter } from 'lucide-react';
import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions';

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
  const deleteMutation = useDeleteTransaction();
  
  const [isSaving, setIsSaving] = useState(false);
  const [needsReset, setNeedsReset] = useState(true);

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [rows, setRows] = useState<RowData[]>([]);

  // Search, Sort, and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof RowData | null, direction: 'asc'|'desc' }>({ key: null, direction: 'asc' });
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  useEffect(() => {
    if (transactions && needsReset) {
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
      }));

      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const combinedRows: RowData[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayTransactions = filteredRows.filter((r: RowData) => r.date === dateStr);
        combinedRows.push(...dayTransactions);

        combinedRows.push({
          id: crypto.randomUUID(),
          date: dateStr,
          description: '',
          amount: '',
          category: '',
          type: 'EXPENSE',
          payment_method: '',
        });
      }

      setRows(combinedRows);
      setNeedsReset(false);
    }
  }, [transactions, needsReset, selectedMonth, selectedYear]);

  const uniqueCategories = Array.from(new Set(rows.map(r => r.category).filter(c => c.trim() !== '')));

  const processedRows = useMemo(() => {
    let result = [...rows];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.amount.includes(q)
      );
    }

    if (filterType !== 'ALL') {
      result = result.filter(r => r.type === filterType);
    }

    if (filterCategory !== 'ALL') {
      result = result.filter(r => r.category === filterCategory);
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = String(a[sortConfig.key]).toLowerCase();
        const bVal = String(b[sortConfig.key]).toLowerCase();
        
        if (sortConfig.key === 'amount') {
          const numA = Number(a.amount) || 0;
          const numB = Number(b.amount) || 0;
          return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
        }
        if (sortConfig.key === 'date') {
          const tA = new Date(a.date).getTime();
          const tB = new Date(b.date).getTime();
          return sortConfig.direction === 'asc' ? tA - tB : tB - tA;
        }
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [rows, searchQuery, filterType, filterCategory, sortConfig]);

  const handleSort = (key: keyof RowData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof RowData) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="opacity-40" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

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

  const removeRow = async (id: string) => {
    const isSavedTransaction = transactions?.some((t: any) => t.id === id);
    if (isSavedTransaction) {
      if (confirm('This will permanently delete this transaction from your ledger. Are you sure?')) {
        await deleteMutation.mutateAsync(id);
        setRows(rows.filter(r => r.id !== id));
      }
    } else {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const updateRow = (id: string, field: keyof RowData, value: string) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const saveAll = async () => {
    // We strictly extract valid rows from the master 'rows' state to not miss hidden items
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

      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
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

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm mb-4">
        <div className="relative w-full md:flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search descriptions, categories, amounts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-colors text-sm"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-colors cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="EXPENSE">Expenses</option>
              <option value="INCOME">Income</option>
            </select>
          </div>
          <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-colors cursor-pointer max-w-[150px]"
            >
              <option value="ALL">All Categories</option>
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
             <div className="p-12 text-center text-slate-500 dark:text-slate-400">Loading your ledger...</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th onClick={() => handleSort('date')} className="px-4 py-3 font-medium w-36 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><div className="flex items-center gap-2">Date {getSortIcon('date')}</div></th>
                  <th onClick={() => handleSort('type')} className="px-4 py-3 font-medium w-32 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><div className="flex items-center gap-2">Type {getSortIcon('type')}</div></th>
                  <th onClick={() => handleSort('description')} className="px-4 py-3 font-medium flex-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><div className="flex items-center gap-2">Description {getSortIcon('description')}</div></th>
                  <th onClick={() => handleSort('category')} className="px-4 py-3 font-medium w-48 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><div className="flex items-center gap-2">Category {getSortIcon('category')}</div></th>
                  <th onClick={() => handleSort('amount')} className="px-4 py-3 font-medium w-36 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><div className="flex items-center gap-2">Amount {getSortIcon('amount')}</div></th>
                  <th className="px-4 py-3 font-medium w-12 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {processedRows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800 group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-1">
                      <input type="date" value={row.date} onChange={e => updateRow(row.id, 'date', e.target.value)} className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 dark:hover:border-slate-600 rounded px-2 py-1.5 outline-none transition-colors text-slate-700 dark:text-slate-300" />
                    </td>
                    <td className="p-1">
                      <select value={row.type} onChange={e => updateRow(row.id, 'type', e.target.value as any)} className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 dark:hover:border-slate-600 rounded px-2 py-1.5 outline-none appearance-none cursor-pointer transition-colors text-slate-700 dark:text-slate-300">
                        <option value="EXPENSE">Expense</option>
                        <option value="INCOME">Income</option>
                      </select>
                    </td>
                    <td className="p-1">
                      <input type="text" placeholder="e.g. Groceries" value={row.description} onChange={e => updateRow(row.id, 'description', e.target.value)} className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 dark:hover:border-slate-600 rounded px-2 py-1.5 outline-none transition-colors text-slate-700 dark:text-slate-300" />
                    </td>
                    <td className="p-1">
                      <input type="text" placeholder="e.g. Food" value={row.category} onChange={e => updateRow(row.id, 'category', e.target.value)} className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 dark:hover:border-slate-600 rounded px-2 py-1.5 outline-none transition-colors text-slate-700 dark:text-slate-300" />
                    </td>
                    <td className="p-1">
                      <div className="relative flex items-center">
                         <span className="absolute left-2 text-slate-400">₹</span>
                         <input type="number" step="0.01" placeholder="0.00" value={row.amount} onChange={e => updateRow(row.id, 'amount', e.target.value)} className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 dark:hover:border-slate-600 rounded pl-6 pr-2 py-1.5 outline-none transition-colors text-slate-700 dark:text-slate-300" />
                      </div>
                    </td>
                    <td className="p-1 text-center">
                      <button onClick={() => removeRow(row.id)} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors p-1.5 rounded-md">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {processedRows.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-slate-500 dark:text-slate-400">
                      No rows match your current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs flex flex-wrap items-center justify-between bg-slate-50 dark:bg-slate-800/20 gap-2">
             <span>Typing in a row makes it valid. Empty rows are silently ignored. Data is isolated to {MONTHS[selectedMonth]} {selectedYear}.</span>
             <span className="font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 px-2 py-1 rounded-md">{processedRows.length} Rows Rendered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
