// app/(auth)/login/page.tsx
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { LogIn, Loader2, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import axios from "axios";
import { toast } from "sonner";

export default function LoginPage() {
  const supabaseClient = createClient();
  const router = useRouter();
  const { user } = useAuthProfile();

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => /\S+@\S+\.\S+/.test(email) && password.length > 0,
    [email, password]
  );

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErr(null);
    setInfo(null);
    setLoading(true);
    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        if (/confirm|verified/i.test(error.message)) {
          setErr("Please verify your email before signing in.");
        } else if (/invalid login credentials/i.test(error.message)) {
          setErr("Invalid email or password.");
        } else {
          setErr(error.message);
        }
        return;
      }
      window.location.href = "/profile";
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

  const onForgot = async () => {
    setErr(null);
    setInfo(null);
    setLoading(true);
    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : undefined;
      await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo });
      setInfo("If an account exists, a reset link has been sent.");
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
    <div className="min-h-[calc(100vh-56px)] bg-[#F6F7F8] text-slate-900">
      <div className="mx-auto max-w-md px-4 py-10">
        {/* Card */}
        <section
          className="rounded-3xl border border-[#E8E8EA] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden"
          aria-labelledby="login-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-[#E8E8EA]">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#7DFF6A] text-black shadow-sm">
                <LogIn className="h-5 w-5" />
              </div>
              <h1 id="login-title" className="text-lg font-semibold">
                Welcome back
              </h1>
            </div>

            <span className="hidden sm:inline-flex items-center rounded-full bg-[#EFEFF1] px-3 py-1 text-xs text-slate-600">
              Secure Sign-in
            </span>
          </div>

          {/* Body */}
          <form onSubmit={onSubmit} className="space-y-5 p-6">
            <LabeledField label="Email" htmlFor="email">
              <StyledInput
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoCapitalize="off"
                autoCorrect="off"
                inputMode="email"
              />
            </LabeledField>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[13px] text-slate-600">
                Password
              </Label>
              <div className="relative">
                <StyledInput
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-1.5 top-1.5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E8E8EA] bg-white hover:bg-[#F6F7F8] transition"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {err && (
              <p className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                <ShieldAlert className="h-4 w-4" /> {err}
              </p>
            )}
            {info && (
              <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                {info}
              </p>
            )}

            <AccentButton
              type="submit"
              disabled={loading || !canSubmit}
              aria-disabled={loading || !canSubmit}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sign in"
              )}
            </AccentButton>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <button
                type="button"
                onClick={onForgot}
                className="underline underline-offset-2 hover:text-slate-900"
                disabled={loading || !email}
                title={!email ? "Enter your email first" : ""}
              >
                Forgot password?
              </button>
              <span>
                New here?{" "}
                <Link
                  href="/register"
                  className="text-slate-900 underline underline-offset-2"
                >
                  Create an account
                </Link>
              </span>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

/* ---------- UI helpers, styled to match neon/pill design ---------- */

function LabeledField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-[13px] text-slate-600">
        {label}
      </Label>
      {children}
    </div>
  );
}

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      {...props}
      className={[
        "h-12 rounded-2xl bg-white",
        "border border-[#E8E8EA] px-3",
        "focus-visible:ring-2 focus-visible:ring-[#7DFF6A] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
      ].join(" ")}
    />
  );
}

function AccentButton({
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={[
        "inline-flex w-full items-center justify-center gap-2 h-11 rounded-full px-5 text-sm font-semibold",
        "bg-[#7DFF6A] text-black shadow-sm transition",
        "hover:brightness-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7DFF6A] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    />
  );
}
