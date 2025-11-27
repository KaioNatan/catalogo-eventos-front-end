import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { DouradosPlusPage } from "./features/eventos/pages/DouradosEventosPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DouradosPlusPage />
  </StrictMode>
);
