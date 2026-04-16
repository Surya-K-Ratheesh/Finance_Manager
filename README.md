<div align="center">
  <h1>💰 FinManager</h1>
  <p><strong>A Professional, Modern Personal Finance & Accounts Manager</strong></p>

  [![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.dev/)
</div>

<br />

## 📖 Overview

**FinManager** is a rigorously designed, mobile-first web application that puts you in absolute control of your personal finances. Built for speed and reliability using the bleeding-edge Tailwind v4 engine, it features true global dark/light mode scaling, automated spreadsheet data entry, sophisticated debt tracking, and real-time algorithmic caching using TanStack React Query.

---

## ✨ Features

- 📊 **Algorithmic Dashboard**: A visual summary of your core liquidity mapped over dynamic `Recharts` area graphs. The "Total Balance" dynamically adjusts in real-time if you temporarily lend or borrow capital!
- 🤝 **Debts & Loans Ledger**: Fully isolated sub-application to natively track "People who owe me" vs "People I owe", directly bridging pending debts into your dashboard's net worth calculation.
- 📑 **Chronological Spreadsheet**: A custom, interactive data-grid engineered with Supabase `.upsert()` capabilities. Features automatic Month/Year time-gating to safely handle dozens of transaction modifications safely.
- 🌓 **Perfected Dual Aesthetics**: Utilizes `next-themes` and explicitly patched Tailwind V4 `@custom-variant` hooks to deliver an absolutely flawless Pitch Dark and Light mode experience natively synchronized with the user's toggle state.
- 🔒 **Secure Authentication**: End-to-end authentication flow backed by Clerk v5, deeply locking database mutations strictly to active user sessions.
- 📱 **Mobile First Navigation**: Re-engineered with responsive Tailwind React states, sporting a hidden Left-Drawer hamburger menu customized for smartphone viewports.
- 🇮🇳 **Rupee (₹) Native**: Formatted strictly to the Indian Rupee currency standard with absolute precision.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Actions, Dynamic Layouts)
- **Language**: [TypeScript](https://www.typescriptlang.org/) 
- **Styling Pipeline**: [Tailwind CSS v4](https://tailwindcss.com/) & [next-themes](https://github.com/pacocoursey/next-themes)
- **Database Architecture**: [Supabase](https://supabase.com/) (PostgreSQL & Aggressive RLS Policies)
- **Authentication Wrapper**: [Clerk](https://clerk.com/)
- **Caching & Mutations**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **Charts & Components**: [Recharts](https://recharts.org/), [Lucide React](https://lucide.dev/), and Radix UI Dialogs.

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/finmanager.git
cd finmanager
```

### 2. Install Dependencies

You can use `npm`, `yarn`, `pnpm`, or `bun`.

```bash
npm install
```

### 3. Setup Supabase (Database)

1. Create a new project at [Supabase](https://supabase.com/).
2. Navigate to the SQL Editor in your Supabase dashboard.
3. Copy the entire contents of the `schema.sql` file provided in the repository root and execute it. This reconstructs BOTH the `transactions` and `debts` tables automatically with their corresponding Row Level Security constraints.
4. Retrieve your `Project URL`, the `public/anon key`, and your **`service_role secret key`** *(crucial for edge bulk upserts!)*.

### 4. Setup Clerk (Authentication)

1. Create a new project at [Clerk](https://clerk.com/).
2. Select your preferred login methods.
3. Retrieve your `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.

### 5. Configure Environment Variables

Create a `.env.local` file in the root directory of your project and populate it with your retrieved keys:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You will be redirected to complete the Clerk authentication loop before entering your secure dashboard.

---

## 🤝 Contributing

Contributions, issues, and feature requests are heartily welcome! Feel free to check the issues page.

## 📝 License

This project is licensed under the [MIT License](LICENSE).
