import "@testing-library/jest-dom";
import { beforeEach } from "vitest";

import "@/domains/admin-cms/auth/installAdminHttpSessionBridge";
import { clearSessionFetchCache } from "@/domains/public-portal/cache/sessionFetchCache";

beforeEach(() => {
  clearSessionFetchCache();
});
