<div align="center">
  <h1>💰 FinManager</h1>
  <p><strong>A Professional, Modern Personal Finance & Accounts Manager</strong></p>

  [![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.dev/)
</div>

<br />

## 📖 Overview

**FinManager** is a beautifully designed, mobile-responsive web application that puts you in control of your personal finances. Built for speed and reliability using the latest web technologies, it features real-time data persistence, a gorgeous dark/light mode UI, interactive analytical charts, and dedicated bulk-data spreadsheet entry interfaces.

---

## ✨ Features

- 📊 **Interactive Dashboard**: A visual summary of your total balance, income, and expenses mapped over dynamic `Recharts` area graphs.
- 🗃️ **Transaction Ledger**: Search and filter your transactions quickly with designated categories, payment methods, and dates.
- 📑 **Spreadsheet Bulk Entry**: A dedicated, interactive data grid letting you add dozens of rows at once—perfect for rapid ledger entry.
- 🔒 **Secure Authentication**: End-to-end authentication flow backed by Clerk, securing your private financial records safely.
- ⚡ **Optimistic Updates**: Highly responsive interactions thanks to TanStack React Query handling instantaneous UI mutations.
- 📱 **Mobile First**: A meticulously crafted Tailwind CSS responsive layout that works flawlessly on devices of any screen size.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Actions, API Routes)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Lucide React](https://lucide.dev/) (Icons)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL & Row Level Security)
- **Authentication**: [Clerk](https://clerk.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **Charts**: [Recharts](https://recharts.org/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

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
3. Copy the contents of the `schema.sql` file provided in the repository root and run it to construct your required `transactions` table with corresponding Row Level Security policies.
4. Retrieve your `Project URL`, your `public/anon key`, and your `service_role/secret key` from your configuration settings.

### 4. Setup Clerk (Authentication)

1. Create a new project at [Clerk](https://clerk.com/).
2. Select your preferred login methods (e.g. Email, Google).
3. Retrieve your `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.

### 5. Configure Environment Variables

Create a `.env.local` file in the root directory of your project and populate it with your retrieved keys:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You will be redirected to complete the Clerk authentication loop before entering your secure dashboard.

---

## 🖼️ Screenshots
> *Tip: Replace `/public/placeholder.png` with actual images of your application UI.*

![Dashboard](https://via.placeholder.com/1200x600/0f172a/ffffff?text=Dashboard+Screenshot)
*The main FinManager analytical dashboard detailing cash flow.*

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/finmanager/issues).

## 📝 License

This project is licensed under the [MIT License](LICENSE).
