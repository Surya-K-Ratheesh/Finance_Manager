'use client';

import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
           <div>
             <h3 className="font-medium text-lg">General Profile</h3>
             <p className="text-slate-500 text-sm">Update your basic display configurations</p>
           </div>
           <button className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors">
              Manage in Clerk
           </button>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
           <div>
             <h3 className="font-medium text-lg">Export Data</h3>
             <p className="text-slate-500 text-sm">Download a complete CSV ledger of your transactions</p>
           </div>
           <button className="mt-4 md:mt-0 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-md font-medium text-sm transition-colors">
              Download CSV
           </button>
        </div>
      </div>
    </div>
  );
}
