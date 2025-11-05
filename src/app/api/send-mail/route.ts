// app/api/send-mail/route.ts

import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const data = await resend.emails.send({
      from: "Gatekeepr <team@gatekeepr.live>", // e.g. newsletter@yourdomain.com
      to: email,
      subject: "Pre-registration Confirmation for NSU Dialogue 2025",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
  <img src="https://95dn3hp0zp.ufs.sh/f/RwfZAb5hM6xzasrVKIvGydWsQDVF3kqAGr4E0wJCIfg1zeim" alt="Event Banner" style="width: 100%; height: auto;" />

  <div style="padding: 20px;">
  <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 10px;">
Hello ${name},</h2>
    <h2 style="color: #333;">
      You're pre-registered for <strong>NSU Dialogue 2025</strong>!
    </h2>

    <p>Thank you for registering. More details will be shared prior to the event day.</p>
  </div>

  <div style="background-color: #f8f8f8; padding: 16px; text-align: center; font-size: 12px; color: #777;">
    <p>Stay connected with us:</p>
    <p>
      <a href="https://www.instagram.com/gatekeep.dhaka/" style="color: #555;">Instagram</a> |
      <a href="https://www.facebook.com/GatekeeprOfficial" style="color: #555;">Facebook</a>
    </p>
    <p>© ${new Date().getFullYear()} Gatekeepr</p>
  </div>
</div>`,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
