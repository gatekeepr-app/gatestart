import { createClient } from "@/utils/supabase/server";
import axios from "axios";
import { NextResponse } from "next/server";
import { eventInt } from "../../../../types/events";

export async function POST(req: Request) {
  try {
    // --- Get eventId and userId from URL query ---
    const { searchParams } = new URL(req.url);
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

    console.log("🗂️ Submitting to Supabase:", submission);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ticki")
      .insert(submission)
      .select();

    const { data: event } = await supabase
      .from("Events")
      .select("*")
      .eq("eventuuid", eventId)
      .single();

    // build a lean, serializable event payload
    const emailEvent = {
      name: event?.name,
      coverimg: (event as eventInt)?.image ?? null,
      date: (event as eventInt)?.date_range.from ?? (event as eventInt)?.date_range?.from ?? null,
      place:
        (event as eventInt)?.place ??
        (event as eventInt)?.place?.title ??
        (event as eventInt)?.place?.details ??
        null,
    };

    const payload = {
      email: body?.email,
      ticketuuid: data?.[0]?.id,
      event: emailEvent,
    };

    // fire-and-forget: do NOT await; add a short timeout so it doesn't hang
    (async () => {
      try {
        await axios.post(
          "https://gatestart.vercel.app/api/send-ticket",
          payload,
          { timeout: 8000 }
        );
      } catch (e) {
        console.warn("send-ticket failed (non-blocking):", e);
      }
    })();

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Supabase insert failed",
          error: error.message,
        },
        { status: 500 }
      );
    }

    console.log("✅ Inserted successfully:", data);

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
