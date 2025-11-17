import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  if (!id || id === "undefined") {
    return NextResponse.json(
      { error: "Invalid ticket ID" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("tickets").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  // FIX: Always return JSON + status 200
  return NextResponse.json({ success: true }, { status: 200 });
}
