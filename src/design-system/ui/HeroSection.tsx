import type { ReactElement, ReactNode } from "react";
import { Button } from "./Button";
import { Card } from "./Card";

type HeroTone = "primary" | "success" | "warning" | "neutral";

interface IHeroAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "ghost" | "accent";
}

interface IHeroSectionProps {
  kicker?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  tone?: HeroTone;
  align?: "left" | "center";
  actions?: IHeroAction[];
  rightSlot?: ReactNode;
  className?: string;
}

interface IHeroToneStyles {
  kicker: string;
  ring: string;
  glow: string;
}

const toneStyles: Record<HeroTone, IHeroToneStyles> = {
  primary: {
    kicker: "text-[var(--color-primary)]",
    ring: "ring-[color:rgba(0,152,201,0.15)]",
    glow: "from-[rgba(0,152,201,0.15)]",
  },
  success: {
    kicker: "text-[var(--color-secondary)]",
    ring: "ring-[color:rgba(13,139,84,0.15)]",
    glow: "from-[rgba(13,139,84,0.15)]",
  },
  warning: {
    kicker: "text-[color:#9a9200]",
    ring: "ring-[color:rgba(223,218,12,0.25)]",
    glow: "from-[rgba(223,218,12,0.18)]",
  },
  neutral: {
    kicker: "text-zinc-500",
    ring: "ring-zinc-200",
    glow: "from-zinc-200/40",
  },
};

export function HeroSection({
  kicker,
  title,
  subtitle,
  tone = "primary",
  align = "left",
  actions,
  rightSlot,
  className = "",
}: IHeroSectionProps): ReactElement {
  const styles: IHeroToneStyles = toneStyles[tone];
  const isCenter: boolean = align === "center";

  return (
    <section className={className} aria-label="Seção principal">
      <Card
        className={[
          "relative overflow-hidden p-6 ring-1 sm:p-10",
          styles.ring,
        ].join(" ")}
      >
        <div
          aria-hidden="true"
          className={[
            "pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl",
            "bg-gradient-to-br",
            styles.glow,
            "to-transparent",
          ].join(" ")}
        />

        <div
          className={[
            "relative flex flex-col gap-5",
            isCenter ? "items-center text-center" : "",
          ].join(" ")}
        >
          <div className="flex w-full items-start justify-between gap-4">
            <div className={isCenter ? "w-full" : "max-w-3xl"}>
              {kicker ? (
                <p
                  className={[
                    "text-xs font-semibold uppercase tracking-[0.14em]",
                    styles.kicker,
                  ].join(" ")}
                >
                  {kicker}
                </p>
              ) : null}

              <h1 className="mt-2 text-2xl font-semibold text-zinc-900 sm:text-3xl">
                {title}
              </h1>

              {subtitle ? (
                <p className="mt-3 text-sm leading-relaxed text-zinc-600 sm:text-base">
                  {subtitle}
                </p>
              ) : null}

              {actions?.length ? (
                <div
                  className={[
                    "mt-5 flex flex-wrap gap-2",
                    isCenter ? "justify-center" : "",
                  ].join(" ")}
                >
                  {actions.map((action: IHeroAction) => {
                    const variant = action.variant ?? "secondary";

                    if (action.href) {
                      return (
                        <a
                          key={action.label}
                          href={action.href}
                          className="inline-flex"
                        >
                          <Button variant={variant} size="md">
                            {action.label}
                          </Button>
                        </a>
                      );
                    }

                    return (
                      <Button
                        key={action.label}
                        variant={variant}
                        size="md"
                        onClick={action.onClick}
                      >
                        {action.label}
                      </Button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {rightSlot ? (
              <div className="hidden shrink-0 sm:block">{rightSlot}</div>
            ) : null}
          </div>
        </div>
      </Card>
    </section>
  );
}
