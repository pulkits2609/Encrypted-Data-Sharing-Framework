import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 7000,
    allowedHosts: [
      "dsproject.pulkitworks.info",    // your Cloudflare Tunnel domain
      "localhost",                     // optional but recommended
      "127.0.0.1",                     // optional
    ],
  },
});
