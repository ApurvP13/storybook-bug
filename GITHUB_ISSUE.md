# UnoCSS utility classes not working in Storybook 10 with webpack (v0.61.x)

## Summary

UnoCSS utility classes are **not being applied** when using `@storybook/react-webpack5` with the `@unocss/webpack` plugin in **UnoCSS v0.61.x**. The webpack plugin runs during compilation, but the generated styles are either empty or not injected into the page.

**This issue is fixed in UnoCSS v0.63.6+** ✅

## Environment

### Versions with the Bug 🐛

```json
{
  "unocss": "0.61.3",
  "@unocss/webpack": "0.61.9",
  "@unocss/reset": "0.61.0",
  "storybook": "10.0.4",
  "@storybook/react-webpack5": "10.0.4",
  "@storybook/addon-webpack5-compiler-swc": "4.0.1",
  "webpack": "5.97.1"
}
```

### Versions that Work ✅

```json
{
  "unocss": "0.63.6",
  "@unocss/webpack": "0.63.6",
  "@unocss/reset": "0.63.6"
}
```

**Additional packages:**
- React 18.3.1
- TypeScript 5.5.2
- `@storybook/preset-scss`: 1.0.3
- `sass`: 1.83.0+

## Reproduction

A complete minimal reproduction is available at:
**[storybook-unocss-reproduction](https://github.com/yourusername/storybook-unocss-reproduction)** _(update with your repo URL)_

### Quick Reproduction Steps

1. Clone the reproduction repository
2. Install dependencies: `npm install`
3. Run Storybook: `npm run storybook`
4. Open the **"UnoCSS/GithubChip"** story
5. **Observe:** UnoCSS utility classes have no styling applied

### To See It Working

1. Upgrade UnoCSS packages:
   ```bash
   npm install --save-dev unocss@^0.63.6 @unocss/webpack@^0.63.6 @unocss/reset@^0.63.6
   ```
2. Restart Storybook
3. **Observe:** All UnoCSS utility classes now work perfectly

## Configuration

### `.storybook/main.ts`

```typescript
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
    if (!storybookConfig.plugins) {
      storybookConfig.plugins = [];
    }

    // Add UnoCSS plugin
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

    return storybookConfig;
  },
};

export default config;
```

### `.storybook/preview.ts`

```typescript
import type { Preview } from '@storybook/react-webpack5';

import "@unocss/reset/tailwind-compat.css";

// UnoCSS styles - this import works in 0.63.6+ but not in 0.61.x
import "uno.css";

import "../src/styles/index.scss";
import "../src/styles/variables.scss";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story: any) => {
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", "dark");
      }
      return Story();
    },
  ],
};

export default preview;
```

### `uno.config.ts`

```typescript
import { defineConfig, presetIcons, presetUno, transformerDirectives } from "unocss";

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
      fiddle: {
        elements: {
          borderColor: "var(--fiddle-elements-borderColor)",
          background: {
            depth: {
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
```

## Expected Behavior

When using UnoCSS utility classes in story components:

```tsx
<div className="bg-blue-500 text-white p-4 rounded-lg flex gap-4">
  <span className="i-ph:github-logo-fill" />
  Content with UnoCSS styles
</div>
```

- ✅ UnoCSS plugin scans story files during webpack compilation
- ✅ Generated CSS with utility class definitions is injected into the page
- ✅ Utility classes are styled correctly
- ✅ Icons from `presetIcons()` are rendered
- ✅ Custom theme colors work
- ✅ No module resolution errors

## Actual Behavior (v0.61.x)

- ❌ UnoCSS webpack plugin runs (visible in logs: `<s> [webpack.Progress] 8% setup compilation unocss:webpack`)
- ❌ But generated CSS is empty or not injected
- ❌ All utility classes have no styling effect
- ❌ Icons don't render (empty spans)
- ❌ Custom theme colors don't work
- ✅ Regular SCSS styles work fine (proves webpack CSS pipeline is functional)

### Console/Network

- No JavaScript errors
- `uno.css` module resolves but contains no actual CSS rules
- Storybook compiles successfully with no warnings

## Analysis

### What We Found

1. **The issue is specific to UnoCSS v0.61.x** when used with:
   - Storybook 10.x
   - `@storybook/react-webpack5`
   - `transformerDirectives()`
   - `presetIcons()`

2. **Upgrading to UnoCSS v0.63.6 completely fixes the issue** with zero configuration changes

3. **SCSS styles work fine** in the same Storybook setup, proving:
   - Webpack is configured correctly
   - CSS loaders are functional
   - The issue is specific to UnoCSS integration

### Root Cause (Hypothesis)

The UnoCSS v0.61.x webpack plugin appears to have an issue with:
- Virtual module generation in webpack 5
- CSS injection into Storybook's webpack compilation
- Compatibility with Storybook's webpack configuration

This was likely fixed between v0.61.x and v0.63.x in the UnoCSS codebase.

## Solution ✅

### For Users Experiencing This Issue

Upgrade to UnoCSS v0.63.6 or later:

```bash
npm install --save-dev unocss@^0.63.6 @unocss/webpack@^0.63.6 @unocss/reset@^0.63.6
```

or with pnpm:

```bash
pnpm add -D unocss@^0.63.6 @unocss/webpack@^0.63.6 @unocss/reset@^0.63.6
```

No other configuration changes needed. Restart Storybook and everything works.

## Additional Context

### Project Context

- Main application uses **Vite + UnoCSS** (works perfectly)
- Storybook uses **webpack + UnoCSS** (broken in v0.61.x, fixed in v0.63.6)
- Reason for webpack: Project-specific requirements (e2b integration, etc.)

### Workarounds Attempted (Before Finding the Fix)

All of these failed with v0.61.x:
- ❌ Different import paths (`uno.css`, `virtual:uno.css`, `@unocss/reset`)
- ❌ Different plugin options (`mode`, `hmr`, `configFile` paths)
- ❌ Adding/removing CSS loaders
- ❌ Changing plugin order in webpack config
- ❌ Manually configuring webpack module rules

### Why This Issue Matters

Many developers are migrating to or using Storybook 10.x with webpack for various reasons (legacy compatibility, specific webpack features, build tool constraints, etc.). If they're using UnoCSS v0.61.x, they'll encounter this bug and waste significant time debugging what appears to be a configuration issue but is actually a version-specific bug.

## Related Issues

- [Add links to any related UnoCSS or Storybook issues if known]

## Checklist

- [x] Minimal reproduction repository created
- [x] Tested with multiple UnoCSS versions (0.61.3, 0.61.9, 0.63.6)
- [x] Verified the fix (upgrade to 0.63.6+)
- [x] Confirmed SCSS works in same environment (not a general webpack issue)
- [x] Documented exact package versions
- [x] Provided complete configuration files

---

**Note for Maintainers:** If this was indeed fixed between v0.61.x and v0.63.x, it might be worth:
1. Documenting this in release notes/changelog
2. Adding a warning for users trying to use v0.61.x with Storybook 10 + webpack
3. Potentially backporting the fix if v0.61.x is still a supported LTS version

Thank you! 🙏

