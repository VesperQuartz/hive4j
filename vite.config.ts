import tsdownConfig from "./tsdown.config.ts";

import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, lazyPlugins } from "vite-plus";
import removeConsole from "vite-plugin-remove-console";

const config = defineConfig(({ mode }) => {
  console.log("mode", mode);
  return {
    staged: {
      "*": "vp check --fix",
    },
    fmt: {},
    lint: {
      jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
      rules: { "vite-plus/prefer-vite-plus-imports": "error" },
      options: { typeAware: true, typeCheck: true },
      ignorePatterns: ["src/components/ui/**"],
      plugins: ["react", "react-perf", "import", "promise"],
    },
    pack: tsdownConfig,
    server: {
      allowedHosts: ["*.local", "*.ngrok-free.app"],
      proxy: {},
    },
    ssr: {
      external: ["pino", "hono-pino", "hono-pino/debug-log", "@relate/relate", "koffi"],
    },
    optimizeDeps: {
      exclude: ["@relate/relate", "koffi"],
    },
    build: {
      rollupOptions: {
        external: ["@relate/relate", "koffi"],
      },
    },
    resolve: {
      tsconfigPaths: true,
    },
    plugins: lazyPlugins(() => [
      devtools(),
      tailwindcss(),
      tanstackStart(),
      babel({
        presets: [reactCompilerPreset()],
        include: [/\.(ts|tsx|js|jsx)$/],
      }),
      removeConsole(),
      nitro(),
      viteReact(),
    ]),
  };
});

export default config;
