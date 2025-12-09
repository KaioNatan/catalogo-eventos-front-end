import type { PropsWithChildren } from "react";

interface CardProps extends PropsWithChildren {
  as?: "div" | "section" | "article";
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  as: Tag = "div",
  className = "",
  ...rest
}) => (
  <Tag
    className={`rounded-2xl border border-white/10 bg-white/5 ${className}`}
    {...rest}
  />
);
