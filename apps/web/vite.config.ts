import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import getPort, { portNumbers } from "get-port";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const devtoolsPort = await getPort({ port: portNumbers(43069, 43099) });

const config = defineConfig({
  root: import.meta.dirname,
  plugins: [
    devtools({
      eventBusConfig: {
        port: devtoolsPort,
      },
    }),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});

export default config;
