export const runtime = "nodejs";

import { NextResponse } from "next/server";
import axios from "axios";
import { toast } from "sonner";
import { getSupabaseAdmin } from "@/utils/supabase/admin";

async function getCallerOrganizerUuid() {
  const sb = getSupabaseAdmin();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { userId: null, organizerUuid: null };

  const { data: prof, error } = await sb
    .from("profiles")
    .select("organizerRef")
    .eq("id", user.id)
    .single();
  if (error || !prof) return { userId: user.id, organizerUuid: null };
  return { userId: user.id, organizerUuid: prof.organizerRef as string | null };
}

export async function POST(req: Request) {
  try {
    const { email, organizerUuid } = await req.json();
    if (!email || !organizerUuid) {
      return NextResponse.json(
        { error: "email and organizerUuid required" },
        { status: 400 }
      );
    }

    const caller = await getCallerOrganizerUuid();
    if (!caller.userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (caller.organizerUuid !== organizerUuid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admin = getSupabaseAdmin();
    // find profile by email
    const { data: target, error: findErr } = await admin
      .from("profiles")
      .select("id, organizerRef")
      .eq("email", email)
      .single();
    if (findErr || !target)
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    // link to organizer
    const { error: upErr } = await admin
      .from("profiles")
      .update({ organizerRef: organizerUuid })
      .eq("id", target.id);
    if (upErr) throw upErr;

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(error.response?.data || error.message);
    } else if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("Unknown error:", error);
    }
    toast("Failed to send mail.");
  }
}

export async function DELETE(req: Request) {
  try {
    const { profileId, organizerUuid } = await req.json();
    if (!profileId || !organizerUuid) {
      return NextResponse.json(
        { error: "profileId and organizerUuid required" },
        { status: 400 }
      );
    }

    const caller = await getCallerOrganizerUuid();
    if (!caller.userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (caller.organizerUuid !== organizerUuid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admin = getSupabaseAdmin();
    const { error: upErr } = await admin
      .from("profiles")
      .update({ organizerRef: null })
      .eq("id", profileId);
    if (upErr) throw upErr;

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(error.response?.data || error.message);
    } else if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("Unknown error:", error);
    }
    toast("Failed to send mail.");
  }
}
