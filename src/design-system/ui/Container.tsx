import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import { cn } from "@/design-system/utils/cn";

export type ContainerSize = "md" | "lg" | "xl";

interface IContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: ContainerSize;
}

const sizeClasses: Record<ContainerSize, string> = {
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
};

export function Container({
  children,
  className,
  size = "xl",
  ...rest
}: IContainerProps): ReactElement {
  return (
    <div
      className={cn("mx-auto w-full px-4", sizeClasses[size], className)}
      {...rest}
    >
      {children}
    </div>
  );
}
