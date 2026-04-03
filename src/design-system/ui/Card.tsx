import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import { cn } from "@/design-system/utils/cn";

type CardPadding = "none" | "sm" | "md" | "lg";

interface ICardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: CardPadding;
  hoverable?: boolean;
}

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  children,
  className,
  padding = "md",
  hoverable = false,
  ...rest
}: ICardProps): ReactElement {
  return (
    <div
      className={cn(
        "rounded-2xl border border-black/5 bg-white shadow-soft",
        paddingClasses[padding],
        hoverable && "transition hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
