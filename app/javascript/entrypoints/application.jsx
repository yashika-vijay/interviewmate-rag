import React from "react";
import { createRoot } from "react-dom/client";
import App from "../App";

const element = document.getElementById("react-root");

if (element) {
  createRoot(element).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
