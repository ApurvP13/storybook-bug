# UnoCSS utility classes not working in Storybook 10 with webpack

## Summary

UnoCSS utility classes are **not being applied** when using `@storybook/react-webpack5` with the `@unocss/webpack` plugin. The webpack plugin appears to run during compilation, but the generated styles are either empty or not injected into the page.

## Environment

**Storybook:**
- `storybook`: `10.0.4`
- `@storybook/react-webpack5`: `10.0.4`
- `@storybook/addon-webpack5-compiler-swc`: `4.0.1`
- `@storybook/preset-scss`: `1.0.3`

**UnoCSS:**
- `unocss`: `0.61.3`
- `@unocss/webpack`: `0.61.9`
- `@unocss/reset`: `0.61.0`

**Build Tools:**
- `webpack`: `5.97.1`
- `css-loader`: `7.1.2`
- `style-loader`: `4.0.0`
- `sass-loader`: `16.0.6`

**Framework:**
- React 18.3.1
- TypeScript 5.5.2
- Node.js >= 18.18.0

## Reproduction Repository

A complete minimal reproduction is available at:
**https://github.com/yourusername/storybook-unocss-reproduction** _(update with actual URL)_

### Steps to Reproduce

1. Clone the reproduction repository
2. Install dependencies: `npm install`
3. Run Storybook: `npm run storybook`
4. Open the **"UnoCSS/GithubChip"** story
5. **Observe:** UnoCSS utility classes have no styling applied

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

// UnoCSS styles
import "uno.css";

// Custom styles
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

### Example Story Component

The reproduction includes a `GithubChip` component that demonstrates the issue:

```tsx
import type { Meta, StoryObj } from '@storybook/react-webpack5';

interface GithubChipProps {
  repoName: string;
  onRemove: () => void;
  chatStarted: boolean;
  isInChat?: boolean;
}

function GithubChip({
  repoName,
  onRemove,
  chatStarted,
  isInChat = false,
}: GithubChipProps) {
  const chipClasses = isInChat
    ? "h-6 px-2 py-1 text-xs"
    : `px-3 py-2 ${chatStarted ? "text-sm" : "text-base"}`;

  return (
    <div className="relative mr-2 group">
      {/* These UnoCSS classes don't work */}
      <div className={`inline-flex items-center gap-1 ${chipClasses} rounded-full bg-fiddle-elements-background-depth-2 border border-fiddle-elements-borderColor text-fiddle-elements-textPrimary`}>
        <span className="i-ph:github-logo-fill" />
        {repoName}
      </div>
      <button
        onClick={onRemove}
        className={`absolute -top-2 -right-2 bg-fiddle-elements-code-background text-white rounded-full ${isInChat ? "w-4 h-4" : "w-6 h-6"} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}
        title="Remove Repository"
      >
        <span className={`i-ph:x ${isInChat ? "text-[10px]" : ""}`} />
      </button>
    </div>
  );
}

const meta: Meta<typeof GithubChip> = {
  title: 'UnoCSS/GithubChip',
  component: GithubChip,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof GithubChip>;

export const Default: Story = {
  args: {
    repoName: 'fiddle-website',
    chatStarted: false,
    isInChat: false,
  },
};

export const InChat: Story = {
  args: {
    repoName: 'storybook-unocss-repro',
    chatStarted: true,
    isInChat: true,
  },
};
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

## Actual Behavior

- ❌ UnoCSS webpack plugin runs (visible in logs: `<s> [webpack.Progress] 8% setup compilation unocss:webpack`)
- ❌ But generated CSS appears to be empty or not injected
- ❌ All utility classes have no styling effect
- ❌ Icons don't render (empty spans)
- ❌ Custom theme colors don't work
- ✅ Regular SCSS styles work fine (proving webpack CSS pipeline is functional)

### Visual Comparison

**What the story looks like (all UnoCSS classes have no effect):**
- No background colors
- No padding or spacing
- No borders or rounded corners
- No icons visible
- No flex layout

**What it should look like:**
- Blue/red/green backgrounds with colors
- Proper padding and spacing
- Rounded corners and borders
- GitHub icon visible
- Flex layout with gaps

### Console/Network/Build Output

- ✅ No JavaScript errors in console
- ✅ Storybook compiles successfully with no warnings
- ✅ Webpack build completes without errors
- ❌ `uno.css` module resolves but appears to contain no CSS rules
- ✅ SCSS files load and work correctly

## Observations

### What Works

1. ✅ **SCSS styles work perfectly** in the same Storybook setup
   - Custom SCSS classes apply correctly
   - CSS variables work
   - Sass compilation works
   - Proves webpack CSS loaders are functional

2. ✅ **UnoCSS works in main app** (using Vite)
   - Same `uno.config.ts`
   - Same utility classes
   - Same components
   - Everything works perfectly

3. ✅ **Webpack compilation succeeds**
   - No build errors
   - No module resolution errors
   - UnoCSS plugin appears in webpack progress logs

### What Doesn't Work

1. ❌ **All UnoCSS utility classes** have no effect
   - Basic utilities: `bg-*`, `text-*`, `p-*`, `m-*`
   - Layout utilities: `flex`, `grid`, `gap-*`
   - Typography: `font-*`, `text-*`
   - Borders: `border-*`, `rounded-*`

2. ❌ **Icon classes** don't work
   - `i-ph:github-logo-fill` renders as empty span
   - No icon SVG is injected

3. ❌ **Custom theme colors** don't work
   - `bg-fiddle-elements-background-depth-2` has no effect
   - CSS variables are defined in SCSS but UnoCSS doesn't use them

4. ❌ **Transformers** appear not to be working
   - `transformerDirectives()` classes have no effect

## Additional Context

### Project Context

- Main application uses **Vite + UnoCSS** (works perfectly)
- Storybook uses **webpack + UnoCSS** (doesn't work)
- Using webpack for Storybook due to specific project requirements (e2b integration)
- UnoCSS config is identical between Vite app and Storybook

### Workarounds Attempted

All of these failed:
- ❌ Different import paths (`uno.css`, `virtual:uno.css`, `@unocss/reset`)
- ❌ Different plugin options (`mode: "build"`, `mode: "global"`, with/without `hmr`)
- ❌ Different plugin positions (`.push()`, `.unshift()`, middle of array)
- ❌ Removing other CSS-related plugins
- ❌ Adding explicit CSS module rules
- ❌ Using `webpack-merge` for config merging
- ❌ Removing `@storybook/preset-scss`
- ❌ Different content include patterns
- ❌ Removing `transformerDirectives()` and `presetIcons()`

### Build Logs

When running `npm run storybook`, the logs show:

```
<s> [webpack.Progress] 8% setup compilation unocss:webpack
```

This indicates the UnoCSS plugin is being registered and running, but the generated CSS is either:
1. Empty
2. Not being injected into the page
3. Being overridden/removed by another plugin

## Questions for Maintainers

1. Is there official documentation for integrating UnoCSS with Storybook's webpack builder?
2. Does the `@unocss/webpack` plugin require special configuration when used with Storybook?
3. Are there known conflicts between Storybook's "implicit CSS loaders" and UnoCSS?
4. Should the virtual module import be `uno.css` or something else for webpack?
5. Does UnoCSS webpack plugin work correctly with webpack 5's module federation/virtual modules in Storybook's context?
6. Are there any special considerations when using `transformerDirectives()` and `presetIcons()` with webpack?

## What We Need

- Guidance on proper UnoCSS + Storybook webpack integration
- Whether this is a bug or configuration issue
- Any debugging steps to understand why CSS isn't being generated/injected
- Whether there's a workaround that doesn't involve switching build tools

## Additional Information

- Willing to provide more debugging information if needed
- Can add logging to webpack config
- Can test with different configurations
- Repository includes complete working reproduction

---

Thank you for looking into this! UnoCSS works great in our Vite app, and we'd love to get it working in Storybook too. 🙏
