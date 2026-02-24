// src/shared/ui/Card.tsx
import type { ElementType, PropsWithChildren } from "react";

interface CardProps extends PropsWithChildren {
  as?: ElementType;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  as: Tag = "div",
  className = "",
  ...rest
}) => {
  return (
    <Tag
      className={`rounded-2xl border border-white/10 bg-white/5 ${className}`}
      {...rest}
    />
  );
};
