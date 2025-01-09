import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/ws": {
        target: "http://localhost:9082",
        ws: true, // Enable WebSocket proxying
        changeOrigin: true,
      },
    },
  },
});
