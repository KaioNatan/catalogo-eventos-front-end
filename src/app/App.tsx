

import React from "react";
import { AppRoutes } from "./routes";
import { AppDataProvider } from "../context/appDataContext";

export const App: React.FC = () => {
  return (
    <AppDataProvider>
      <AppRoutes />
    </AppDataProvider>
  );
};

