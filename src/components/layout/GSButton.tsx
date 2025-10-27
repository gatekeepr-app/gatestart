"use client";

import Link from "next/link";

export type GSButtonVariant = "primary" | "ghost" | "black";

type GSButtonProps = {
  text: string;
  href: string;
  variant?: GSButtonVariant;
  className?: string;
  prefetch?: boolean;
};

export default function GSButton({
  text,
  href,
  variant = "primary",
  className = "",
  prefetch,
}: GSButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium " +
    "transition shadow-sm select-none focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7DFF6A]";

  const styleMap: Record<GSButtonVariant, string> = {
    primary: "bg-[#7DFF6A] text-black hover:brightness-95",
    ghost:
      "bg-white text-slate-900 border border-[#E8E8EA] hover:bg-slate-50",
    black: "bg-[#0B0B0B] text-white hover:opacity-90",
  };

  const classes = `${base} ${styleMap[variant]} ${className}`;

  return (
    <Link href={href} prefetch={prefetch} className={classes} aria-label={text}>
      {text}
    </Link>
  );
}
