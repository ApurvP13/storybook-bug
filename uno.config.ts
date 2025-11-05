import { defineConfig, presetIcons, presetUno, transformerDirectives } from "unocss";

const BASE_COLORS = {
  white: "#FFFFFF",
  gray: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#E5E5E5",
    300: "#D4D4D4",
    400: "#A3A3A3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#1b1b1b",
  },
  accent: {
    500: "#FF6101",
  },
};

export default defineConfig({
  content: {
    pipeline: {
      include: [
        "./src/**/*.{ts,tsx,js,jsx,html,vue,svelte,astro,mdx}",
        "./.storybook/**/*.{ts,tsx,js,jsx,html,mdx}",
        "./stories/**/*.{ts,tsx,js,jsx,mdx}",
      ],
    },
  },
  shortcuts: {
    "transition-theme": "transition-[background-color,border-color,color] duration-150",
  },
  theme: {
    colors: {
      ...BASE_COLORS,
      fiddle: {
        elements: {
          borderColor: "var(--fiddle-elements-borderColor)",
          background: {
            depth: {
              1: "var(--fiddle-elements-bg-depth-1)",
              2: "var(--fiddle-elements-bg-depth-2)",
            },
          },
          textPrimary: "var(--fiddle-elements-textPrimary)",
          code: {
            background: "var(--fiddle-elements-code-background)",
          },
        },
      },
    },
  },
  transformers: [transformerDirectives()],
  presets: [
    presetUno({
      dark: {
        light: "[data-theme=\"light\"]",
        dark: "[data-theme=\"dark\"]",
      },
    }),
    presetIcons({
      warn: true,
      collections: {
        ph: () => import('@iconify-json/ph/icons.json').then(i => i.default as any),
      },
    }),
  ],
});
