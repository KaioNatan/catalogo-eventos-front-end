import { cn } from "@/design-system/utils/cn";
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "accent";
type ButtonSize = "sm" | "md" | "lg";

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-white hover:opacity-90 focus-visible:outline-[var(--color-primary)]",
  secondary:
    "bg-[var(--color-secondary)] text-white hover:opacity-90 focus-visible:outline-[var(--color-secondary)]",
  accent:
    "bg-[var(--color-accent)] text-zinc-900 hover:opacity-90 focus-visible:outline-[var(--color-accent)]",
  ghost:
    "border border-white/50 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 focus-visible:outline-white",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  disabled,
  type = "button",
  ...rest
}: IButtonProps): ReactElement {
  const isDisabled: boolean = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl font-semibold transition outline-none disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {isLoading ? "Carregando..." : children}
    </button>
  );
}
