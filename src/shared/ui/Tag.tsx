// src/shared/ui/Tag.tsx
import type { PropsWithChildren } from "react";

type TagVariant = "default" | "outline" | "success" | "warning";

interface TagProps extends PropsWithChildren {
  variant?: TagVariant;
  className?: string;
}

const variantClasses: Record<TagVariant, string> = {
  default: "bg-white/10 text-[#e9f2ff] border-white/10",
  outline: "bg-transparent text-[#e9f2ff] border-white/20",
  success: "bg-emerald-500/15 text-emerald-200 border-emerald-500/40",
  warning: "bg-amber-500/15 text-amber-200 border-amber-500/40",
};

export const Tag: React.FC<TagProps> = ({
  variant = "default",
  className = "",
  children,
}) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
