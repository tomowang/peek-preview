import { defineConfig } from "wxt";
import removeConsole from "vite-plugin-remove-console";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "Peek Preview - Arc like link preview",
    default_locale: "en",
    permissions: ["storage", "declarativeNetRequest"],
    host_permissions: ["*://*/*"],
  },
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-react"],
  vite: (configEnv) => ({
    plugins:
      configEnv.mode === "production"
        ? [removeConsole({ includes: ["log"] })]
        : [],
  }),
});
