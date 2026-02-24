// src/shared/ui/IconButton.tsx
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import {
  forwardRef,
} from "react";

interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    PropsWithChildren {
  size?: "sm" | "md";
  variant?: "ghost" | "filled";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      size = "md",
      variant = "ghost",
      className = "",
      type = "button",
      children,
      ...rest
    },
    ref
  ) => {
    const sizeClasses = size === "sm" ? "h-8 w-8" : "h-9 w-9";
    const variantClasses =
      variant === "ghost"
        ? "bg-transparent hover:bg-white/10"
        : "bg-white/10 hover:bg-white/20 border border-white/20";

    return (
      <button
        ref={ref}
        type={type}
        className={`inline-flex items-center justify-center rounded-full text-sm text-[#e9f2ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-[#74f1ff] ${sizeClasses} ${variantClasses} ${className}`}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
