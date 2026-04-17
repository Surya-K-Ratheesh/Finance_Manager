'use client';

import { useState } from 'react';
import { useDebts, useAddDebt, useUpdateDebt, useDeleteDebt } from '@/hooks/useDebts';
import { HandCoins, Plus, CheckCircle2, Trash2, Search, ArrowDownAZ } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export default function DebtsPage() {
  const { data: debts, isLoading } = useDebts();
  const { mutateAsync: addDebt } = useAddDebt();
  const { mutate: updateDebt } = useUpdateDebt();
  const { mutate: deleteDebt } = useDeleteDebt();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    person_name: '',
    amount: '',
    type: 'LENT', // LENT = Someone owes me, BORROWED = I owe someone
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.person_name || !formData.amount) return;
    
    await addDebt({
      person_name: formData.person_name,
      amount: Number(formData.amount),
      type: formData.type as 'LENT' | 'BORROWED',
      status: 'PENDING',
      created_at: formData.date ? new Date(formData.date).toISOString() : undefined,
    });
    
    setIsModalOpen(false);
    setFormData({ person_name: '', amount: '', type: 'LENT', date: new Date().toISOString().split('T')[0] });
  };

  const handleSettle = (id: string, currentStatus: string) => {
    updateDebt({ id, status: currentStatus === 'PENDING' ? 'SETTLED' : 'PENDING' });
  };

  if (isLoading) return <div className="text-center py-20 text-slate-500 dark:text-slate-400">Loading debts...</div>;

  const filteredDebts = debts?.filter(d => 
     d.person_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const lentDebts = filteredDebts.filter(d => d.type === 'LENT');
  const borrowedDebts = filteredDebts.filter(d => d.type === 'BORROWED');

  const totalOwedToMe = lentDebts.filter(d => d.status === 'PENDING').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalIOwe = borrowedDebts.filter(d => d.status === 'PENDING').reduce((acc, curr) => acc + Number(curr.amount), 0);

  const groupedLent = lentDebts.reduce((acc, curr) => {
    if (!acc[curr.person_name]) acc[curr.person_name] = [];
    acc[curr.person_name].push(curr);
    return acc;
  }, {} as Record<string, typeof debts>);

  const groupedBorrowed = borrowedDebts.reduce((acc, curr) => {
    if (!acc[curr.person_name]) acc[curr.person_name] = [];
    acc[curr.person_name].push(curr);
    return acc;
  }, {} as Record<string, typeof debts>);

  // Unique names for datalist regardless of search match
  const uniqueNames = Array.from(new Set(debts?.map(d => d.person_name) || []));

  const sortEntries = (entries: [string, any][]) => {
     return entries.sort((a, b) => {
       const totalA = a[1].filter((d: any) => d.status === 'PENDING').reduce((sum: number, d: any) => sum + Number(d.amount), 0);
       const totalB = b[1].filter((d: any) => d.status === 'PENDING').reduce((sum: number, d: any) => sum + Number(d.amount), 0);
       if (sortBy === 'name-asc') return a[0].localeCompare(b[0]);
       if (sortBy === 'name-desc') return b[0].localeCompare(a[0]);
       if (sortBy === 'money-desc') return totalB - totalA;
       if (sortBy === 'money-asc') return totalA - totalB;
       return 0;
     });
  };

  const lentEntries = sortEntries(Object.entries(groupedLent));
  const borrowedEntries = sortEntries(Object.entries(groupedBorrowed));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
           <div className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg">
             <HandCoins size={24} />
           </div>
           Debts & Loans
        </h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 dark:text-slate-100 px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors">
          <Plus size={18} /> Add Entry
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-6 rounded-xl">
           <h3 className="text-emerald-800 dark:text-emerald-400 font-medium">To Receive</h3>
           <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-500 mt-2">₹{totalOwedToMe.toFixed(2)}</p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-6 rounded-xl">
           <h3 className="text-rose-800 dark:text-rose-400 font-medium">To Give</h3>
           <p className="text-3xl font-bold text-rose-600 dark:text-rose-500 mt-2">₹{totalIOwe.toFixed(2)}</p>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div className="relative w-full sm:flex-1">
           <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
           <input 
              type="text" 
              placeholder="Search by person's name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
           />
        </div>
        <div className="relative w-full sm:w-auto flex items-center gap-2">
           <ArrowDownAZ size={18} className="text-slate-400 shrink-0" />
           <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors cursor-pointer"
           >
              <option value="name-asc">Sort: Name (A-Z)</option>
              <option value="name-desc">Sort: Name (Z-A)</option>
              <option value="money-desc">Pending Amount (High-Low)</option>
              <option value="money-asc">Pending Amount (Low-High)</option>
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* People Who Owe Me */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2">People who owe me</h2>
          <div className="space-y-4">
             {lentEntries.length === 0 ? <p className="text-slate-500 dark:text-slate-400 text-sm">No records match your criteria.</p> : lentEntries.map(([person, personDebts]) => {
                const pendingSum = personDebts.filter((d: any) => d.status === 'PENDING').reduce((sum: number, d: any) => sum + Number(d.amount), 0);
                const allSettled = pendingSum === 0;

                return (
                  <div key={person} className={`border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-opacity ${allSettled ? 'opacity-60' : ''}`}>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                       <h4 className={`font-semibold ${allSettled ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>{person}</h4>
                       <span className="font-bold text-emerald-600 dark:text-emerald-400">Total: ₹{pendingSum.toFixed(2)}</span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {personDebts.map((debt: any) => (
                         <div key={debt.id} className={`p-3 px-4 flex items-center justify-between ${debt.status === 'SETTLED' ? 'bg-slate-50/50 dark:bg-slate-900/20' : 'bg-white dark:bg-slate-950'}`}>
                            <div>
                               <span className={`text-sm block ${debt.status === 'SETTLED' ? 'line-through text-slate-400 dark:text-slate-500' : 'font-medium'}`}>₹{Number(debt.amount).toFixed(2)}</span>
                               <span className="text-xs text-slate-400">{new Date(debt.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleSettle(debt.id, debt.status)} title={debt.status === 'PENDING' ? 'Mark Settled' : 'Unsettle'} className={`p-1.5 flex items-center gap-1 text-xs rounded-md font-medium transition-colors ${debt.status === 'SETTLED' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800' : 'bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 text-slate-500 dark:bg-slate-900 dark:border-slate-700 dark:hover:border-emerald-800 dark:text-slate-400'}`}>
                                  <CheckCircle2 size={14} /> {debt.status === 'PENDING' ? 'Settle' : 'Settled'}
                                </button>
                                <button onClick={() => deleteDebt(debt.id)} className="p-1.5 rounded-md border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-400 dark:bg-slate-900 dark:border-slate-700 dark:hover:border-rose-900/50 transition-colors">
                                  <Trash2 size={16} />
                                </button>
                            </div>
                         </div>
                      ))}
                    </div>
                  </div>
                );
             })}
          </div>
        </div>

        {/* People I Owe */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2">People I owe</h2>
          <div className="space-y-4">
             {borrowedEntries.length === 0 ? <p className="text-slate-500 dark:text-slate-400 text-sm">No records match your criteria.</p> : borrowedEntries.map(([person, personDebts]) => {
                const pendingSum = personDebts.filter((d: any) => d.status === 'PENDING').reduce((sum: number, d: any) => sum + Number(d.amount), 0);
                const allSettled = pendingSum === 0;

                return (
                  <div key={person} className={`border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-opacity ${allSettled ? 'opacity-60' : ''}`}>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                       <h4 className={`font-semibold ${allSettled ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>{person}</h4>
                       <span className="font-bold text-rose-600 dark:text-rose-400">Total: ₹{pendingSum.toFixed(2)}</span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {personDebts.map((debt: any) => (
                         <div key={debt.id} className={`p-3 px-4 flex items-center justify-between ${debt.status === 'SETTLED' ? 'bg-slate-50/50 dark:bg-slate-900/20' : 'bg-white dark:bg-slate-950'}`}>
                            <div>
                               <span className={`text-sm block ${debt.status === 'SETTLED' ? 'line-through text-slate-400 dark:text-slate-500' : 'font-medium'}`}>₹{Number(debt.amount).toFixed(2)}</span>
                               <span className="text-xs text-slate-400">{new Date(debt.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleSettle(debt.id, debt.status)} title={debt.status === 'PENDING' ? 'Mark Settled' : 'Unsettle'} className={`p-1.5 flex items-center gap-1 text-xs rounded-md font-medium transition-colors ${debt.status === 'SETTLED' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800' : 'bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 text-slate-500 dark:bg-slate-900 dark:border-slate-700 dark:hover:border-emerald-800 dark:text-slate-400'}`}>
                                  <CheckCircle2 size={14} /> {debt.status === 'PENDING' ? 'Settle' : 'Settled'}
                                </button>
                                <button onClick={() => deleteDebt(debt.id)} className="p-1.5 rounded-md border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-400 dark:bg-slate-900 dark:border-slate-700 dark:hover:border-rose-900/50 transition-colors">
                                  <Trash2 size={16} />
                                </button>
                            </div>
                         </div>
                      ))}
                    </div>
                  </div>
                );
             })}
          </div>
        </div>
      </div>

      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-950 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <Dialog.Title className="text-lg font-semibold">Record Debt or Loan</Dialog.Title>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={formData.type === 'LENT'} onChange={() => setFormData({...formData, type: 'LENT'})} className="accent-indigo-600" />
                    I gave money (Lent)
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={formData.type === 'BORROWED'} onChange={() => setFormData({...formData, type: 'BORROWED'})} className="accent-indigo-600" />
                    I got money (Borrowed)
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Person Name</label>
                <input required list="existing-persons" type="text" placeholder="Select existing or type new" value={formData.person_name} onChange={(e) => setFormData({...formData, person_name: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
                <datalist id="existing-persons">
                   {uniqueNames.map(name => <option key={name} value={name} />)}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium mb-1">Date</label>
                   <input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                   <input required type="number" step="0.01" min="0" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
                 </div>
              </div>
              
              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400 font-medium">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors">Save Record</button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
