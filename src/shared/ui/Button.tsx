// src/shared/ui/Button.tsx
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import {
  forwardRef,
} from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    PropsWithChildren {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center rounded-xl border text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-[#74f1ff] disabled:opacity-60 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "border-[#a58cff]/60 bg-gradient-to-r from-[#74f1ff]/30 to-[#a58cff]/30 hover:from-[#74f1ff]/40 hover:to-[#a58cff]/40 text-[#e9f2ff]",
  secondary:
    "border-white/10 bg-white/10 hover:bg-white/15 text-[#e9f2ff]",
  danger:
    "border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-red-100",
  ghost:
    "border-transparent bg-transparent hover:bg-white/5 text-[#e9f2ff]",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      fullWidth,
      className = "",
      type = "button",
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={`${base} ${variants[variant]} ${sizes[size]} ${
          fullWidth ? "w-full" : ""
        } ${className}`}
        {...rest}
      />
    );
  }
);

Button.displayName = "Button";
