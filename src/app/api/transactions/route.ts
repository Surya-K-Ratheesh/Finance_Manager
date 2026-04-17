import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// We instantiate Supabase inside the handler to ensure it can be dynamic.
// We use the SERVICE ROLE key to bypass RLS because we strictly authorize via Clerk's userId in this secure backend context.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const rows = Array.isArray(body) ? body : [body];

  const payload = rows.map((row) => {
    const entry: any = {
      user_id: userId,
      description: row.description,
      amount: row.amount,
      type: row.type,
      category: row.category,
      payment_method: row.payment_method,
      date: row.date,
    };
    if (row.id) entry.id = row.id;
    return entry;
  });

  const { data, error } = await supabase
    .from("transactions")
    .upsert(payload, { onConflict: 'id' })
    .select();

  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return new NextResponse("Missing ID", { status: 400 });
  }

  const { error } = await supabase
    .from("transactions")
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
    .from("transactions")
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return new NextResponse(error.message, { status: 500 });
  
  return NextResponse.json(data);
}
