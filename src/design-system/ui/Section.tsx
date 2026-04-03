import type { ElementType, ReactElement, ReactNode } from "react";
import { cn } from "@/design-system/utils/cn";
import { Container, type ContainerSize } from "./Container";

type SectionSpacing = "sm" | "md" | "lg" | "xl";

interface ISectionProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  spacing?: SectionSpacing;
  containerSize?: ContainerSize;
}

const spacingClasses: Record<SectionSpacing, string> = {
  sm: "py-6",
  md: "py-8",
  lg: "py-10",
  xl: "py-14",
};

export function Section({
  children,
  className,
  as: Component = "section",
  spacing = "lg",
  containerSize = "xl",
}: ISectionProps): ReactElement {
  return (
    <Component className={cn(spacingClasses[spacing], className)}>
      <Container size={containerSize}>{children}</Container>
    </Component>
  );
}
