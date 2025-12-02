import React, { type PropsWithChildren } from "react";

interface CardProps extends PropsWithChildren {
  className?: string;
}

export const Card: React.FC<CardProps> = ({ className = "", ...rest }) => (
  <div
    className={`rounded-2xl border border-white/10 bg-white/5 ${className}`}
    {...rest}
  />
);
