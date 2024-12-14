import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Set the output directory to `dist` or `public` based on Vercel's requirement
    outDir: "dist",  // or "public" if you want to match Vercel's default
  },
  server: {
    port: 3001,
    proxy: {
      "/api": {
        target: "http://localhost:4002",
        changeOrigin: true,
      },
    },
  },
});
