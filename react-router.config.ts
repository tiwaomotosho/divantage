import type { Config } from "@react-router/dev/config";

// ADR-008: static prerender, no runtime server. Paths come from the content loader.
export default {
  ssr: false,
  async prerender() {
    const { prerenderPaths } = await import("./src/lib/content.server");
    return prerenderPaths();
  },
} satisfies Config;
