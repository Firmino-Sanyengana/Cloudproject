import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: { 
    alias: { "@": path.resolve(__dirname, "./src") } 
  },
  server: {
    host: '0.0.0.0',    // 👈 ADICIONE ESTA LINHA (libera acesso na rede)
    port: 4001,          // Porta do frontend
    proxy: {
      "/api": { 
        target: "http://localhost:4000",  // Seu backend Express
        changeOrigin: true,
      },
    },
  },
});