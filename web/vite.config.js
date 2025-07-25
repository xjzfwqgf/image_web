import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  server: { 
    //设置路径为./
    base: './',
    proxy: {
      "/login": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/images": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/image": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/token": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/getemail": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/comment": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/comments": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/like": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/unlike": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/likes": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/updata": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/delete_image": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/logout": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/register": {
        target: "http://localhost:80",
        changeOrigin: true,
      },

    },
  },
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
