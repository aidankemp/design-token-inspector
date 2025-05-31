import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dts from "vite-plugin-dts";

// https://vite.dev/config/
export default defineConfig({
  publicDir: false,
  plugins: [
    react(),
    dts({
      tsconfigPath: "./tsconfig.app.json",
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "index",
      fileName: "index",
    },
    rollupOptions: {
      external: [
        "@ant-design/icon",
        "antd",
        "lodash",
        "react",
        "react-dom",
        "**/demo/**",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "@ant-design/icon": "AntDesignIcon",
          antd: "Antd",
          lodash: "Lodash",
        },
      },
    },
  },
});
