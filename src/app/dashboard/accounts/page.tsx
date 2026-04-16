'use client';

import { Wallet } from "lucide-react";

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
           <Wallet size={32} />
        </div>
        <h2 className="text-xl font-medium mb-2">Connect Your Bank Accounts</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-6">
          This feature evaluates Plaid or Stripe connectivity to automatically sync your real-world bank transactions. Currently running in MVP Local Mode!
        </p>
        <button className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-6 py-2 rounded-md font-medium">
          Coming Soon
        </button>
      </div>
    </div>
  );
}
