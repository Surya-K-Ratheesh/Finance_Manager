'use client';

import { useState } from 'react';
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Wallet, Settings, Table, HandCoins, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from 'next/navigation';

import { ThemeToggle } from '@/components/ThemeToggle';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const NavLinks = () => (
    <>
      <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${pathname === '/dashboard' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
        <LayoutDashboard size={20} /> Dashboard
      </Link>
      <Link href="/dashboard/spreadsheet" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${pathname === '/dashboard/spreadsheet' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
        <Table size={20} /> Spreadsheet
      </Link>
      <Link href="/dashboard/debts" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${pathname === '/dashboard/debts' ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
        <HandCoins size={20} /> Debts
      </Link>
      <Link href="/dashboard/settings" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${pathname === '/dashboard/settings' ? 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
        <Settings size={20} /> Settings
      </Link>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden text-sm md:text-base">
      {/* Sidebar for Desktop */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 hidden md:flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 font-bold tracking-tight text-xl">
          FinManager
        </div>
        <nav className="flex-1 py-4 px-4 space-y-2">
          <NavLinks />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 relative">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between px-4 md:px-6 shrink-0 relative z-10 w-full">
          <div className="flex items-center gap-2 md:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
               <Menu size={24} />
            </button>
            <div className="font-bold text-lg">FinManager</div>
          </div>
          <div className="ml-auto flex items-center gap-3 md:gap-5">
            <ThemeToggle />
            <UserButton />
          </div>
        </header>

        {/* Mobile Navigation Drawer Overlay */}
        {isMobileMenuOpen && (
           <div className="fixed inset-0 z-50 md:hidden flex">
              {/* Dark overlay backdrop */}
              <div 
                 className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                 onClick={() => setIsMobileMenuOpen(false)}
              ></div>
              
              {/* Drawer */}
              <div className="w-64 h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col relative shadow-2xl animate-in slide-in-from-left duration-300">
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-bold tracking-tight text-xl">FinManager</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                     <X size={20} />
                  </button>
                </div>
                <nav className="flex-1 py-4 px-4 space-y-2 overflow-y-auto">
                  <NavLinks />
                </nav>
              </div>
           </div>
        )}

        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
