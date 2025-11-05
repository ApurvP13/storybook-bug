# Storybook + UnoCSS Webpack Integration Bug Reproduction

This repository demonstrates a **version-specific bug** in UnoCSS v0.61.x when used with Storybook 10 and webpack.

## 🐛 The Bug

UnoCSS utility classes **do not work** in Storybook when using:
- UnoCSS v0.61.3 / v0.61.9
- Storybook 10.0.4
- `@storybook/react-webpack5`
- `@unocss/webpack` plugin

## ✅ The Fix

**Upgrade to UnoCSS v0.63.6+** and everything works!

```bash
npm install --save-dev unocss@^0.63.6 @unocss/webpack@^0.63.6 @unocss/reset@^0.63.6
```

## Quick Start

### See the Bug (Current State)

```bash
npm install
npm run storybook
```

Open any story and you'll see:
- ✅ SCSS styles work perfectly
- ❌ UnoCSS utility classes have no effect

### See the Fix

```bash
# Upgrade UnoCSS
npm install --save-dev unocss@^0.63.6 @unocss/webpack@^0.63.6 @unocss/reset@^0.63.6

# Restart Storybook
npm run storybook
```

Now all UnoCSS classes work! 🎉

## What This Demonstrates

This repository reproduces the exact issue from a production environment where:
- Main app uses **Vite + UnoCSS** (works)
- Storybook uses **webpack + UnoCSS** (broken in v0.61.x)

### Story Included

**UnoCSS/GithubChip** - A real-world component demonstrating the issue:
- Icon classes (`i-ph:github-logo-fill`, `i-ph:x`)
- Custom theme variables (`bg-fiddle-elements-background-depth-2`)
- Utility classes (`flex`, `gap-1`, `rounded-full`, `border`, etc.)
- Responsive sizing with conditional classes
- Hover states with `group-hover:` modifier
- Dynamic classes based on props
- SCSS styles work (proving webpack CSS pipeline is functional)

## Configuration

### Current Setup (Reproduces Bug)

```json
{
  "unocss": "^0.61.3",
  "@unocss/webpack": "^0.61.9",
  "@unocss/reset": "^0.61.0"
}
```

### Working Setup

```json
{
  "unocss": "^0.63.6",
  "@unocss/webpack": "^0.63.6",
  "@unocss/reset": "^0.63.6"
}
```

## Files Overview

- `.storybook/main.ts` - Storybook webpack config with UnoCSS plugin
- `.storybook/preview.ts` - Imports `uno.css` and SCSS styles
- `uno.config.ts` - UnoCSS config with `transformerDirectives()` and `presetIcons()`
- `src/stories/` - Example stories demonstrating the issue
- `src/styles/` - SCSS files (work in both versions, proving webpack is functional)
- `GITHUB_ISSUE.md` - Complete bug report for submitting to GitHub

## Environment

- **Storybook:** 10.0.4
- **React:** 18.3.1
- **UnoCSS:** 0.61.3 (broken) / 0.63.6 (working)
- **@unocss/webpack:** 0.61.9 (broken) / 0.63.6 (working)
- **Webpack:** 5.97.1
- **Framework:** @storybook/react-webpack5
- **Additional:** SWC compiler, SCSS preset, Iconify icons

## Key Observations

### With v0.61.x (Broken) ❌
- UnoCSS webpack plugin loads
- Webpack compilation succeeds
- `uno.css` resolves but contains no CSS rules
- All utility classes are unstyled
- No console errors

### With v0.63.6 (Working) ✅
- Same configuration
- All utility classes work perfectly
- Icons render correctly
- Custom theme colors apply
- Zero issues

### SCSS Baseline (Always Works) ✅
- Custom SCSS styles work in both versions
- Proves webpack CSS loaders are functional
- Confirms issue is specific to UnoCSS integration

## For Maintainers

This is a **clean, minimal reproduction** that:
- ✅ Isolates the issue to UnoCSS version
- ✅ Demonstrates both broken and working states
- ✅ Includes complete configuration
- ✅ Shows real-world usage patterns
- ✅ Provides visual proof via Storybook UI

## Related Files

- **GITHUB_ISSUE.md** - Copy-paste ready issue for GitHub
- **package.json** - Exact dependency versions
- **.storybook/** - Complete Storybook configuration
- **uno.config.ts** - Production-like UnoCSS setup

## License

MIT - Feel free to use this reproduction for bug reports, testing, or documentation.

---

**TL;DR:** If you're using UnoCSS v0.61.x with Storybook 10 + webpack and utility classes aren't working, upgrade to UnoCSS v0.63.6+ to fix it.
