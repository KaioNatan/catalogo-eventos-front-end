import type { JSX } from "react";
import { AppProviders } from "./providers/AppProviders";
import { AppRoutes } from "./routes";

export default function App(): JSX.Element {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
