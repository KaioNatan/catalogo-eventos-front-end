import { useEffect, useState, type ReactElement } from "react";
import { Link } from "react-router-dom";
import { Container } from "@/design-system/ui";
import type { ISocialLink } from "@/entities/social-link/socialLink.types";
import { publicApiClient } from "@/services/public-api/client";

export function SiteFooter(): ReactElement {
  const [socialLinks, setSocialLinks] = useState<ISocialLink[]>([]);

  useEffect(() => {
    let isActive: boolean = true;

    async function loadSocialLinks(): Promise<void> {
      try {
        const response: ISocialLink[] =
          await publicApiClient.listActiveSocialLinks();

        if (!isActive) {
          return;
        }

        setSocialLinks(response);
      } catch {
        if (!isActive) {
          return;
        }

        setSocialLinks([]);
      }
    }

    void loadSocialLinks();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <footer className="mt-12 border-t border-zinc-200 bg-white">
      <Container className="py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm font-semibold text-zinc-900">Celeiro do MS</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Plataforma para divulgação de eventos, cidades e pontos turísticos
              da região.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-zinc-900">Navegação</p>
            <ul className="mt-2 space-y-2 text-sm text-zinc-600">
              <li>
                <Link className="hover:text-zinc-900" to="/eventos">
                  Eventos
                </Link>
              </li>
              <li>
                <Link className="hover:text-zinc-900" to="/pontos-turisticos">
                  Pontos turísticos
                </Link>
              </li>
              <li>
                <Link className="hover:text-zinc-900" to="/sobre">
                  Sobre
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-zinc-900">
              Mídias sociais
            </p>

            {socialLinks.length > 0 ? (
              <ul className="mt-2 space-y-2 text-sm text-zinc-600">
                {socialLinks.map((item: ISocialLink) => (
                  <li key={item.id}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={item.label}
                      className="hover:text-zinc-900"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-zinc-500">
                Nenhuma mídia social disponível.
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-zinc-900">Créditos</p>
            <p className="mt-2 text-sm text-zinc-600">
              © {new Date().getFullYear()} Celeiro do MS. Todos os direitos
              reservados.
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              Desenvolvido para divulgação regional.
            </p>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between text-xs text-zinc-500">
          <span>Feito com foco em UX, conteúdo e valorização regional.</span>

          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--color-secondary)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
          </span>
        </div>
      </Container>
    </footer>
  );
}
