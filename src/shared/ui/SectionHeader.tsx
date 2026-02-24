// src/shared/ui/SectionHeader.tsx
import type { PropsWithChildren, ReactNode } from "react";

interface SectionHeaderProps extends PropsWithChildren {
  kicker?: string; // texto pequeno acima do título
  align?: "left" | "center";
  description?: ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  kicker,
  children,
  align = "left",
  description,
  className = "",
}) => {
  const alignClass =
    align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <header
      className={`flex flex-col gap-2 ${alignClass} ${className}`}
    >
      {kicker && (
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#9fb0c8] font-semibold">
          {kicker}
        </p>
      )}
      <h2 className="text-xl md:text-2xl font-extrabold">{children}</h2>
      {description && (
        <p className="text-xs md:text-sm text-[#cfe0fb] max-w-2xl">
          {description}
        </p>
      )}
    </header>
  );
};
