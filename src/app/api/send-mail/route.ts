// app/api/send-mail/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

export const runtime = "nodejs"; // avoid Edge time limits for external HTTP

const Body = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120).optional(),
});

const resend = new Resend(process.env.RESEND_API_KEY);

function cors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*"); // or pickOrigin(req)
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return res;
}
export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}

// --- POST handler ---
export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return cors(
        NextResponse.json(
          { error: "Invalid body", issues: parsed.error.flatten() },
          { status: 400 }
        )
      );
    }

    const { email, name } = parsed.data;

    // Optional: generate an idempotency key so duplicate clicks don’t double-send
    const idemKey = crypto.randomUUID();

    const { data, error } = await resend.emails.send({
      from: "Gatekeepr <team@gatekeepr.live>", // must be a verified sender/domain in Resend
      to: [email],
      subject: "Pre-registration Confirmation for NSU Dialogue 2025",
      headers: { "X-Entity-Ref-ID": idemKey },
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
  <img src="https://95dn3hp0zp.ufs.sh/f/RwfZAb5hM6xzasrVKIvGydWsQDVF3kqAGr4E0wJCIfg1zeim" alt="Event Banner" style="width: 100%; height: auto;" />
  <div style="padding: 20px;">
    <h2 style="font-size: 18px; margin: 0 0 8px 0;">Hello ${name ?? "there"},</h2>
    <h3 style="margin: 0 0 12px 0;">You're pre-registered for <strong>NSU Dialogue 2025</strong>!</h3>
    <p style="margin: 0;">Thank you for registering. More details will be shared prior to the event day.</p>
  </div>
  <div style="background:#f8f8f8; padding:16px; text-align:center; font-size:12px; color:#777;">
    <p style="margin:0 0 8px 0;">Stay connected with us:</p>
    <p style="margin:0;">
      <a href="https://www.instagram.com/gatekeep.dhaka/" style="color:#555;">Instagram</a> |
      <a href="https://www.facebook.com/GatekeeprOfficial" style="color:#555;">Facebook</a>
    </p>
    <p style="margin:8px 0 0 0;">© ${new Date().getFullYear()} Gatekeepr</p>
  </div>
</div>`,
    });

    if (error) {
      // Resend returns rich errors; surface useful parts
      return cors(
        NextResponse.json(
          { error: error.message ?? "Resend error", details: error },
          { status: 502 }
        )
      );
    }

    return cors(NextResponse.json({ ok: true, id: data?.id }));
  } catch (e: unknown) {
    const msg = getErrorMessage(e);
    return cors(NextResponse.json({ error: msg }, { status: 500 }));
  }
}

// Helper: normalize unknown errors to a safe message
function getErrorMessage(e: unknown): string {
  if (typeof e === "object" && e !== null) {
    const maybe = e as { code?: string; message?: string; name?: string };
    if (maybe.code === "ECONNABORTED" || maybe.name === "AbortError") {
      return "Upstream timeout while sending email";
    }
    if (typeof maybe.message === "string" && maybe.message.length > 0) {
      return maybe.message;
    }
  }
  if (typeof e === "string" && e.length > 0) return e;
  return "Failed to send email";
}
