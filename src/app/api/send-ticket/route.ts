import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import axios from "axios";
import { toast } from "sonner";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, event, ticketuuid } = await req.json();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.SMT_USER,
        pass: process.env.SMT_PASS,
      },
    });

    const mailOptions = {
      from: "Gatekeepr <confirmation.gatekeepr@gmail.com>",
      to: email,
      subject: `${event.name} Ticket Confirmation`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
  <img src="${
    event.image
  }" alt="Event Banner" style="width: 100%; height: auto;" />

  <div style="padding: 20px;">
    <h2 style="color: #333;">
      You're registered for <strong>${event.name}</strong>!
    </h2>

    <p>📅 <strong>Date:</strong> ${new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(event.date_range.from))}</p>

    <p>📍 <strong>Location:</strong> ${event.place.title}</p>

    <p>Thank you for registering. Your ticket is confirmed. More details will be shared closer to the event day.</p>

    <div style="margin-top: 30px; text-align: center;">
      <p style="font-weight: bold; margin-bottom: 10px;">🎟️ Your Ticket QR Code:</p>
      <img 
        src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${ticketuuid}" 
        alt="Ticket QR Code" 
        style="margin-top: 10px; max-width: 100%;" 
      />
    </div>
  </div>

  <div style="background-color: #f8f8f8; padding: 16px; text-align: center; font-size: 12px; color: #777;">
    <p>Stay connected with us:</p>
    <p>
      <a href="https://www.instagram.com/gatekeep.dhaka/" style="color: #555;">Instagram</a> |
      <a href="https://www.facebook.com/GatekeeprOfficial" style="color: #555;">Facebook</a>
    </p>
    <p>© ${new Date().getFullYear()} Gatekeepr</p>
  </div>
</div>
`,
    };

    const mailResponse = await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, mailResponse });
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
