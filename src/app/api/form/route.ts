// app/api/form/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // ensure background work isn't killed immediately

export async function POST(req: Request) {
  try {
    // --- Get eventId and userId from URL query ---
    const { searchParams, origin } = new URL(req.url);
    const userId = searchParams.get("userId") || "";
    const eventId = searchParams.get("eventId") || "";

    // --- Parse the form body (supports JSON or FormData) ---
    let body: Record<string, string> = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        body[key] = typeof value === "string" ? value : ""; // ignore files
      });
    }

    // --- Build the record to insert ---
    const submission = {
      userid: userId,
      eventid: eventId,
      formdata: body,
    };

    const supabase = await createClient();
    const { data, error } = await supabase.from("ticki").insert(submission).select();

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return NextResponse.json(
        { success: false, message: "Supabase insert failed", error: error.message },
        { status: 500 }
      );
    }

    // --- Send email (await with a short timeout) ---
    const payload = {
      email: body?.email,
      name: submission.formdata?.name || submission.formdata?.tm1 || "",
    };

    // Prefer your own deployment's mail route; avoids CORS and cross-app drift
    const sendMailUrl = `${origin}/api/send-mail`;

    // Small timeout wrapper around fetch (3s)
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 3000);

    try {
      const res = await fetch(sendMailUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(t);

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.warn("send-mail non-200:", res.status, txt);
      }
    } catch (e) {
      clearTimeout(t);
      console.warn("send-mail failed:", e);
    }

    return NextResponse.json(
      { success: true, message: "Form data saved successfully", data },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error processing form submission:", error);
    return NextResponse.json(
      { success: false, message: "Error processing submission" },
      { status: 500 }
    );
  }
}
