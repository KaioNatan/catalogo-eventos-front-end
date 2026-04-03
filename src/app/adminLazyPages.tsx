import { lazy } from "react";

export const AdminLoginPageLazy = lazy(() =>
  import("@/domains/admin-cms/auth/pages/AdminLoginPage").then((m) => ({
    default: m.AdminLoginPage,
  })),
);

export const AdminDashboardPageLazy = lazy(() =>
  import("@/domains/admin-cms/dashboard/pages/AdminDashboardPage").then(
    (m) => ({ default: m.AdminDashboardPage }),
  ),
);

export const AdminInstitutionalPageLazy = lazy(() =>
  import("@/domains/admin-cms/institutional/pages/AdminInstitutionalPage").then(
    (m) => ({ default: m.AdminInstitutionalPage }),
  ),
);

export const AdminSocialLinksPageLazy = lazy(() =>
  import("@/domains/admin-cms/social-links/pages/AdminSocialLinksPage").then(
    (m) => ({ default: m.AdminSocialLinksPage }),
  ),
);

export const AdminCitiesListPageLazy = lazy(() =>
  import("@/domains/admin-cms/cities/pages/AdminCitiesListPage").then((m) => ({
    default: m.AdminCitiesListPage,
  })),
);

export const AdminCityFormPageLazy = lazy(() =>
  import("@/domains/admin-cms/cities/pages/AdminCityFormPage").then((m) => ({
    default: m.AdminCityFormPage,
  })),
);

export const AdminEventsListPageLazy = lazy(() =>
  import("@/domains/admin-cms/events/pages/AdminEventsListPage").then((m) => ({
    default: m.AdminEventsListPage,
  })),
);

export const AdminEventFormPageLazy = lazy(() =>
  import("@/domains/admin-cms/events/pages/AdminEventFormPage").then((m) => ({
    default: m.AdminEventFormPage,
  })),
);

export const AdminTouristPointsListPageLazy = lazy(() =>
  import("@/domains/admin-cms/tourist-points/pages/AdminTouristPointsListPage").then(
    (m) => ({ default: m.AdminTouristPointsListPage }),
  ),
);

export const AdminTouristPointFormPageLazy = lazy(() =>
  import("@/domains/admin-cms/tourist-points/pages/AdminTouristPointFormPage").then(
    (m) => ({ default: m.AdminTouristPointFormPage }),
  ),
);

export const AdminHomeBannersPageLazy = lazy(() =>
  import("@/domains/admin-cms/home-content/pages/AdminHomeBannersPage").then(
    (m) => ({ default: m.AdminHomeBannersPage }),
  ),
);

export const AdminHomeHighlightsPageLazy = lazy(() =>
  import("@/domains/admin-cms/home-content/pages/AdminHomeHighlightsPage").then(
    (m) => ({ default: m.AdminHomeHighlightsPage }),
  ),
);
