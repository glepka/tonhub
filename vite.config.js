import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/tonhub/" : "/",
  plugins: [react()],
  css: {
    modules: {
      localsConvention: "camelCase",
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});


