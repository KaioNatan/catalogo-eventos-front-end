import type { ReactElement } from "react";
import { Navigate, useRoutes } from "react-router-dom";

import {
  AdminCitiesListPageLazy,
  AdminCityFormPageLazy,
  AdminDashboardPageLazy,
  AdminEventFormPageLazy,
  AdminEventsListPageLazy,
  AdminHomeBannersPageLazy,
  AdminHomeHighlightsPageLazy,
  AdminInstitutionalPageLazy,
  AdminLoginPageLazy,
  AdminSocialLinksPageLazy,
  AdminTouristPointFormPageLazy,
  AdminTouristPointsListPageLazy,
} from "@/app/adminLazyPages";
import { PublicLayout } from "@/shell/public/layouts/PublicLayout";
import { AdminAuthBoundary } from "@/shell/admin/AdminAuthBoundary";
import { AdminAuthLayout } from "@/shell/admin/layouts/AdminAuthLayout";
import { AdminLayout } from "@/shell/admin/layouts/AdminLayout";

import { HomePage } from "@/domains/home-institucional/pages/HomePage";
import { EventosPage } from "@/domains/catalogo-publico/eventos/pages/EventosPage";
import { EventoDetailsPage } from "@/domains/catalogo-publico/eventos/pages/EventoDetailsPage";
import { PontosTuristicosPage } from "@/domains/catalogo-publico/pontos/pages/PontosTuristicosPage";
import { PontoTuristicoDetailsPage } from "@/domains/catalogo-publico/pontos/pages/PontoTuristicoDetailsPage";
import { CidadesPage } from "@/domains/cidades-institucional/pages/CidadesPage";
import { CityDetailsPage } from "@/domains/cidades-institucional/pages/CityDetailsPage";
import { AboutPage } from "@/domains/institucional/pages/AboutPage";

import { AdminRouteGuard } from "@/domains/admin-cms/auth/guards/AdminRouteGuard";
import { PublicNotFoundPage } from "@/shell/public/pages/PublicNotFoundPage";

export function AppRoutes(): ReactElement | null {
  return useRoutes([
    {
      path: "/",
      element: <PublicLayout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "eventos", element: <EventosPage /> },
        { path: "eventos/:id", element: <EventoDetailsPage /> },
        { path: "pontos-turisticos", element: <PontosTuristicosPage /> },
        {
          path: "pontos-turisticos/:id",
          element: <PontoTuristicoDetailsPage />,
        },
        { path: "cidades", element: <CidadesPage /> },
        { path: "cidades/:slug", element: <CityDetailsPage /> },
        { path: "sobre", element: <AboutPage /> },
      ],
    },
    {
      path: "/admin",
      element: <AdminAuthBoundary />,
      children: [
        {
          element: <AdminAuthLayout />,
          children: [{ path: "login", element: <AdminLoginPageLazy /> }],
        },
        {
          element: <AdminRouteGuard />,
          children: [
            {
              element: <AdminLayout />,
              children: [
                { index: true, element: <AdminDashboardPageLazy /> },
                {
                  path: "institucional",
                  element: <AdminInstitutionalPageLazy />,
                },
                {
                  path: "home",
                  element: <Navigate to="/admin/home/banners" replace />,
                },
                {
                  path: "home/banners",
                  element: <AdminHomeBannersPageLazy />,
                },
                {
                  path: "home/destaques",
                  element: <AdminHomeHighlightsPageLazy />,
                },
                {
                  path: "midias-sociais",
                  element: <AdminSocialLinksPageLazy />,
                },
                {
                  path: "cidades",
                  element: <AdminCitiesListPageLazy />,
                },
                {
                  path: "cidades/nova",
                  element: <AdminCityFormPageLazy />,
                },
                {
                  path: "cidades/:id/editar",
                  element: <AdminCityFormPageLazy />,
                },
                {
                  path: "eventos",
                  element: <AdminEventsListPageLazy />,
                },
                {
                  path: "eventos/novo",
                  element: <AdminEventFormPageLazy />,
                },
                {
                  path: "eventos/:id/editar",
                  element: <AdminEventFormPageLazy />,
                },
                {
                  path: "pontos-turisticos",
                  element: <AdminTouristPointsListPageLazy />,
                },
                {
                  path: "pontos-turisticos/novo",
                  element: <AdminTouristPointFormPageLazy />,
                },
                {
                  path: "pontos-turisticos/:id/editar",
                  element: <AdminTouristPointFormPageLazy />,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      path: "*",
      element: <PublicLayout />,
      children: [{ path: "*", element: <PublicNotFoundPage /> }],
    },
  ]);
}
