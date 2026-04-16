import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  // A very simple landing page for unsigned users
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-950 text-slate-50">
      <h1 className="text-5xl font-bold mb-4 tracking-tight">FinManager</h1>
      <p className="text-slate-400 mb-8 max-w-lg text-center">
        The professional personal finance and accounts manager built for speed and reliability.
      </p>
      <a href="/sign-in" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors">
        Sign In to Access Dashboard
      </a>
    </div>
  );
}
