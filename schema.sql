-- Supabase SQL Schema for Personal Finance & Accounts Manager

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the transactions table
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Corresponds to the User ID from Clerk Auth
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    type TEXT CHECK (type IN ('INCOME', 'EXPENSE')) NOT NULL,
    category TEXT NOT NULL,
    payment_method TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies so users can only access their own data
-- Note: Since we are using Clerk for auth, the user_id comes from our app,
-- not from Supabase's native auth.uid(). As a result, we bypass RLS for the service role
-- or use a custom claim configuration if we send JWTs.
-- For a standard setup passing user_id explicitly from the server using the Supabase Service role, 
-- or if configured via JWT integrations with Clerk:

CREATE POLICY "Users can only view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid()::text = user_id OR current_setting('request.jwt.claims', true)::json->>'sub' = user_id);

CREATE POLICY "Users can only insert their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR current_setting('request.jwt.claims', true)::json->>'sub' = user_id);

CREATE POLICY "Users can only update their own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid()::text = user_id OR current_setting('request.jwt.claims', true)::json->>'sub' = user_id)
  WITH CHECK (auth.uid()::text = user_id OR current_setting('request.jwt.claims', true)::json->>'sub' = user_id);

CREATE POLICY "Users can only delete their own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid()::text = user_id OR current_setting('request.jwt.claims', true)::json->>'sub' = user_id);

-- If you only fetch via server actions with Service Role Key, RLS policies won't block it.
