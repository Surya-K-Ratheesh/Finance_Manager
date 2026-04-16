'use client';

import { useTransactions, useDeleteTransaction } from "@/hooks/useTransactions";
import { useMemo, useState } from "react";
import { ArrowUpRight, ArrowDownRight, DollarSign, Plus, Trash2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TransactionModal from "@/components/TransactionModal";

export default function DashboardPage() {
  const { data: transactions, isLoading } = useTransactions();
  const deleteMutation = useDeleteTransaction();

  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = useMemo(() => {
    if (!transactions) return { totalBalance: 0, totalIncome: 0, totalExpenses: 0 };
    return transactions.reduce((acc, curr) => {
      if (curr.type === 'INCOME') {
        acc.totalIncome += Number(curr.amount);
        acc.totalBalance += Number(curr.amount);
      } else {
        acc.totalExpenses += Number(curr.amount);
        acc.totalBalance -= Number(curr.amount);
      }
      return acc;
    }, { totalBalance: 0, totalIncome: 0, totalExpenses: 0 });
  }, [transactions]);

  const chartData = useMemo(() => {
    if (!transactions) return [];
    // Simple grouping by date
    const grouped = transactions.reduce((acc: any, curr) => {
      const date = new Date(curr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!acc[date]) acc[date] = { date, income: 0, expense: 0 };
      if (curr.type === 'INCOME') acc[date].income += Number(curr.amount);
      else acc[date].expense += Number(curr.amount);
      return acc;
    }, {});
    
    return Object.values(grouped).reverse(); // Assuming original is ordered desc
  }, [transactions]);

  const filteredTransactions = transactions?.filter(t => 
    t.description.toLowerCase().includes(filter.toLowerCase()) || 
    t.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors">
          <Plus size={18} /> Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-4">
            <h3 className="font-medium">Total Balance</h3>
            <DollarSign size={20} className="text-blue-500" />
          </div>
          <div className="text-3xl font-bold">${stats.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-4">
            <h3 className="font-medium">Total Income</h3>
            <ArrowUpRight size={20} className="text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-500">+${stats.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-4">
            <h3 className="font-medium">Total Expenses</h3>
            <ArrowDownRight size={20} className="text-rose-500" />
          </div>
          <div className="text-3xl font-bold text-rose-500">-${stats.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold mb-6">Cash Flow</h3>
        <div className="h-72 w-full">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center text-slate-500">Loading chart...</div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
             <div className="w-full h-full flex items-center justify-center text-slate-500">No data to display.</div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold">Recent Transactions</h3>
          <input 
            type="text" 
            placeholder="Search..." 
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md bg-transparent text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading transactions...</td></tr>
              ) : filteredTransactions?.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No transactions found.</td></tr>
              ) : (
                filteredTransactions?.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{t.description}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md text-xs">{t.category}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{new Date(t.date).toLocaleDateString()}</td>
                    <td className={`px-6 py-4 text-right font-medium ${t.type === 'INCOME' ? 'text-emerald-500' : ''}`}>
                      {t.type === 'INCOME' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => deleteMutation.mutate(t.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                         <Trash2 size={16} />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
