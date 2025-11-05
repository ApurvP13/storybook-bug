import type { Preview } from '@storybook/react-webpack5';

import "@unocss/reset/tailwind-compat.css";

// UnoCSS styles - THIS IS WHERE THE BUG OCCURS
import "uno.css";

// Then custom styles (these can override UnoCSS)
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
      // Set the theme attribute for CSS variables
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", "dark");
      }
      return Story();
    },
  ],
};

export default preview;
