import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/global.css";

const rootEl = document.getElementById("root");
const root = createRoot(rootEl);

root.render(
  <BrowserRouter basename="/tonhub">
    <App />
  </BrowserRouter>
);
