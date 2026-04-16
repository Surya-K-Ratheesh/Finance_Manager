import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Wallet, Settings, Table } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 font-bold tracking-tight text-xl">
          FinManager
        </div>
        <nav className="flex-1 py-4 px-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium text-slate-600 dark:text-slate-400">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link href="/dashboard/spreadsheet" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium text-slate-600 dark:text-slate-400">
            <Table size={20} /> Spreadsheet
          </Link>
          <Link href="/dashboard/accounts" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium text-slate-600 dark:text-slate-400">
            <Wallet size={20} /> Accounts
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium text-slate-600 dark:text-slate-400">
            <Settings size={20} /> Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between px-6 shrink-0">
          <div className="md:hidden font-bold">FinManager</div>
          <div className="ml-auto flex items-center gap-4">
            <UserButton />
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
