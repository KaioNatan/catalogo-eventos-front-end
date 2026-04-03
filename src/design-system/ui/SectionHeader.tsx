import type { PropsWithChildren, ReactElement, ReactNode } from "react";
import { cn } from "@/design-system/utils/cn";

type SectionHeaderTone = "neutral" | "primary" | "success" | "warning";

interface ISectionHeaderProps extends PropsWithChildren {
  kicker?: string;
  align?: "left" | "center";
  description?: ReactNode;
  className?: string;
  tone?: SectionHeaderTone;
}

const kickerTone: Record<SectionHeaderTone, string> = {
  neutral: "text-zinc-500",
  primary: "text-[var(--color-primary)]",
  success: "text-[var(--color-secondary)]",
  warning: "text-[color:#9a9200]",
};

export function SectionHeader({
  kicker,
  children,
  align = "left",
  description,
  className,
  tone = "primary",
}: ISectionHeaderProps): ReactElement {
  const alignClass: string =
    align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <header className={cn("flex flex-col gap-2", alignClass, className)}>
      {kicker ? (
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.14em]",
            kickerTone[tone],
          )}
        >
          {kicker}
        </p>
      ) : null}

      <h2 className="text-xl font-semibold text-zinc-900 sm:text-2xl">
        {children}
      </h2>

      {description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-600">
          {description}
        </p>
      ) : null}
    </header>
  );
}
