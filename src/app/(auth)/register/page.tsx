// app/(auth)/register/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { useAuthProfile } from "@/hooks/useAuthProfile";

type Step = "register" | "verify";

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const supabase = createClient();
  const { user } = useAuthProfile();
  if (user) redirect("/");

  const canSubmitRegister = useMemo(
    () => !!name.trim() && /\S+@\S+\.\S+/.test(email) && password.length >= 8,
    [name, email, password]
  );
  const canSubmitOtp = useMemo(() => otp.trim().length === 6, [otp]);

  const register = async () => {
    setErr(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok)
        throw new Error(data.error || "Registration failed");
      setUserId(data.userId);
      setStep("verify");
      setInfo(
        "We sent a 6-digit code to your email. Enter it below to verify."
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("Unknown error:", error);
      }
      toast("Failed to send mail.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!userId) return;
    setErr(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email, code: otp }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok)
        throw new Error(data.error || "Verification failed");

      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInErr) throw new Error(signInErr.message);

      setInfo("Verified! Redirecting…");
      window.location.href = "/profile/edit";
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("Unknown error:", error);
      }
      toast("Failed to send mail.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!userId) return;
    setErr(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Resend failed");
      setInfo("A new code has been sent. Check your inbox.");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("Unknown error:", error);
      }
      toast("Failed to send mail.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white text-black">
      <div className="mx-auto max-w-md px-4 py-10">
        {/* Ticket card */}
        <section
          className="rounded-3xl border-2 border-black bg-white shadow-[4px_4px_0_#000] overflow-hidden"
          aria-labelledby="register-title"
        >
          {/* Header */}
          <div className="flex items-center gap-2 border-b-2 border-black bg-white px-5 py-4">
            <div className="grid h-9 w-9 place-items-center rounded-xl border-2 border-black bg-white shadow-[3px_3px_0_#000]">
              {step === "register" ? (
                <ShieldCheck className="h-5 w-5" />
              ) : (
                <Mail className="h-5 w-5" />
              )}
            </div>
            <h1 id="register-title" className="text-lg font-bold">
              {step === "register"
                ? "Create your account"
                : "Verify your email"}
            </h1>
          </div>

          {/* Body */}
          <div className="space-y-4 p-5">
            {step === "register" ? (
              <>
                <LabeledField label="Full name" htmlFor="name">
                  <StyledInput
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                  />
                </LabeledField>

                <LabeledField label="Email" htmlFor="email">
                  <StyledInput
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoCapitalize="off"
                    autoCorrect="off"
                    inputMode="email"
                  />
                </LabeledField>

                <LabeledField
                  label="Password"
                  htmlFor="password"
                  hint="At least 8 characters"
                >
                  <StyledInput
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </LabeledField>

                {err && <p className="text-sm text-red-600">{err}</p>}
                {info && <p className="text-sm text-emerald-700">{info}</p>}

                <TicketButton
                  onClick={register}
                  disabled={loading || !canSubmitRegister}
                  aria-disabled={loading || !canSubmitRegister}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create account"
                  )}
                </TicketButton>

                <p className="text-xs text-black/70">
                  Already have an account?{" "}
                  <Link href="/login" className="underline">
                    Sign in
                  </Link>
                </p>
              </>
            ) : (
              <>
                <LabeledField label="Enter 6-digit code" htmlFor="otp">
                  <StyledInput
                    id="otp"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="123456"
                  />
                </LabeledField>
                <p className="text-xs text-black/70">
                  Sent to <span className="font-medium">{email}</span>. Expires
                  in 10 minutes.
                </p>

                {err && <p className="text-sm text-red-600">{err}</p>}
                {info && <p className="text-sm text-emerald-700">{info}</p>}

                <div className="flex gap-2">
                  <TicketButton
                    onClick={verifyOtp}
                    disabled={loading || !canSubmitOtp}
                    aria-disabled={loading || !canSubmitOtp}
                    className="flex-1"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Verify & Continue"
                    )}
                  </TicketButton>
                  <GhostButton
                    onClick={resend}
                    disabled={loading}
                    className="flex-1"
                  >
                    Resend code
                  </GhostButton>
                </div>

                <GhostButton
                  onClick={() => setStep("register")}
                  className="w-full"
                >
                  Change email
                </GhostButton>
              </>
            )}
          </div>

          {/* Ticket tear bottom (optional, decorative) */}
          <div
            aria-hidden
            className="h-6 [background:repeating-linear-gradient(90deg,transparent_0_18px,#000_18px_36px)]"
            style={{
              maskImage:
                "radial-gradient(6px_6px_at_18px_0,#000_97%,transparent_100%)",
            }}
          />
        </section>
      </div>
    </div>
  );
}

/* ---------- Tiny UI helpers for ticket look ---------- */

function LabeledField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-[13px]">
        {label}
      </Label>
      {hint && <div className="text-[11px] text-black/60">{hint}</div>}
      {children}
    </div>
  );
}

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      {...props}
      className={[
        "h-11 rounded-xl bg-white",
        "border-2 border-black",
        "focus-visible:ring-2 focus-visible:ring-black",
      ].join(" ")}
    />
  );
}

function TicketButton({
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={[
        "inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold",
        "border-2 border-black bg-[#FBE200] text-black",
        "shadow-[4px_4px_0_#000] transition-shadow duration-200 hover:shadow-[7px_7px_0_#000]",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    />
  );
}

function GhostButton({
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={[
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold",
        "border-2 border-black bg-white",
        "shadow-[3px_3px_0_#000] transition-shadow duration-200 hover:shadow-[4px_4px_0_#000]",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    />
  );
}
