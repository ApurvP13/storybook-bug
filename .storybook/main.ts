import UnoCSS from "@unocss/webpack";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import webpack from "webpack";
import type { StorybookConfig } from "@storybook/react-webpack5";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  addons: [
    "@storybook/addon-webpack5-compiler-swc",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/preset-scss",
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  webpackFinal: async (storybookConfig) => {
    // Ensure plugins array exists
    if (!storybookConfig.plugins) {
      storybookConfig.plugins = [];
    }

    // Add UnoCSS plugin first (important for CSS ordering)
    storybookConfig.plugins.unshift(
      UnoCSS({
        configFile: path.resolve(__dirname, "..", "uno.config.ts"),
        hmr: true,
        mode: "build",
      })
    );

    // Add environment variables
    storybookConfig.plugins.push(
      new webpack.DefinePlugin({
        "import.meta.env.DEV": JSON.stringify(true),
        "import.meta.env.PROD": JSON.stringify(false),
        "import.meta.env.MODE": JSON.stringify("development"),
        "process.env.NODE_ENV": JSON.stringify("development"),
      })
    );

    storybookConfig.resolve = storybookConfig.resolve || {};
    storybookConfig.resolve.alias = {
      ...(storybookConfig.resolve.alias || {}),
      "~": path.resolve(__dirname, "..", "src"),
    };
    storybookConfig.resolve.extensions = [
      ...(storybookConfig.resolve.extensions || []),
      ".scss",
    ];

    // SCSS handled by @storybook/preset-scss to avoid duplicate CSS loader pipelines

    return storybookConfig;
  },
};

export default config;
