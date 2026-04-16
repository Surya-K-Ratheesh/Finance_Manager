import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// We use the SERVICE ROLE key to bypass RLS because we strictly authorize via Clerk's userId in this secure backend context.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const rows = Array.isArray(body) ? body : [body];

  const payload = rows.map((row) => {
    const entry: any = {
      user_id: userId,
      person_name: row.person_name,
      amount: row.amount,
      type: row.type,
      status: row.status || 'PENDING',
      due_date: row.due_date || null,
      notes: row.notes || '',
    };
    if (row.id) entry.id = row.id;
    return entry;
  });

  const { data, error } = await supabase
    .from("debts")
    .upsert(payload, { onConflict: 'id' })
    .select();

  if (error) {
    console.error("Supabase insert error (debts):", error);
    return new NextResponse(error.message, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return new NextResponse("Missing ID", { status: 400 });

  const { error } = await supabase
    .from("debts")
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return new NextResponse("Missing ID", { status: 400 });

  const { data, error } = await supabase
    .from("debts")
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json(data);
}
