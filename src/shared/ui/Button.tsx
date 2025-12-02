import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import React from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    PropsWithChildren {
  variant?: Variant;
  size?: "sm" | "md";
}

const base =
  "inline-flex items-center justify-center rounded-xl border text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950";

const variants: Record<Variant, string> = {
  primary:
    "border-[#a58cff]/60 bg-gradient-to-r from-[#74f1ff]/30 to-[#a58cff]/30 hover:from-[#74f1ff]/40 hover:to-[#a58cff]/40",
  secondary:
    "border-white/10 bg-white/10 hover:bg-white/15 text-[#e9f2ff]",
  danger:
    "border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-red-200",
  ghost: "border-transparent bg-transparent hover:bg-white/5",
};

const sizes = {
  sm: "px-3 py-1",
  md: "px-4 py-2",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "secondary",
  size = "md",
  className = "",
  ...rest
}) => (
  <button
    className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    {...rest}
  />
);
