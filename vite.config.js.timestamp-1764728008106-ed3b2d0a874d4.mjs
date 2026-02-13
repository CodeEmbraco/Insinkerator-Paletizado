// vite.config.js
import { defineConfig } from "file:///F:/app/git/genealogy_thermo/node_modules/vite/dist/node/index.js";

// postcss.config.js
import tailwind from "file:///F:/app/git/genealogy_thermo/node_modules/tailwindcss/lib/index.js";
import autoprefixer from "file:///F:/app/git/genealogy_thermo/node_modules/autoprefixer/lib/autoprefixer.js";

// src/css/tailwind.config.js
var tailwind_config_default = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#009B4A",
        secondary: "rgba(0,155,74,0.10)",
        third: "#839DE2",
        hover: "#009B4A",
        gray: "rgb(156 163 175)",
        textSidebar: "rgba(35, 31, 32, 0.45)",
        hoverTextSidebar: "#15B053",
        textHover: "#009B4A",
        focusHover: "#009B4A",
        focus: "rgb(148 163 184)",
        borderInput: "#E6E6E6",
        textTableHeader: "rgba(45, 49, 57, 0.8)",
        textTableItem: "#2D3139"
      },
      boxShadow: {
        DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.02)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.01)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.01)"
      },
      outline: {
        blue: "2px solid rgba(0, 112, 244, 0.5)"
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        work: ["Work Sans"]
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.5" }],
        sm: ["0.875rem", { lineHeight: "1.5715" }],
        base: ["1rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        lg: ["1.125rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        xl: ["1.25rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        "2xl": ["1.5rem", { lineHeight: "1.33", letterSpacing: "-0.01em" }],
        "3xl": ["1.88rem", { lineHeight: "1.33", letterSpacing: "-0.01em" }],
        "4xl": ["2.25rem", { lineHeight: "1.25", letterSpacing: "-0.02em" }],
        "5xl": ["3rem", { lineHeight: "1.25", letterSpacing: "-0.02em" }],
        "6xl": ["3.75rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }]
      },
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px"
      },
      borderWidth: {
        3: "3px"
      },
      minWidth: {
        36: "9rem",
        44: "11rem",
        56: "14rem",
        60: "15rem",
        72: "18rem",
        80: "20rem"
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem"
      },
      zIndex: {
        60: "60"
      }
    }
  },
  plugins: [
    // eslint-disable-next-line global-require
    // require('@tailwindcss/forms'),
    // add custom variant for expanding sidebar
    // plugin(({ addVariant, e }) => {
    //   addVariant('sidebar-expanded', ({ modifySelectors, separator }) => {
    //     modifySelectors(
    //       ({ className }) =>
    //         `.sidebar-expanded .${e(
    //           `sidebar-expanded${separator}${className}`
    //         )}`
    //     );
    //   });
    // }),
  ]
};

// postcss.config.js
var postcss_config_default = {
  plugins: [tailwind(tailwind_config_default), autoprefixer]
};

// vite.config.js
import react from "file:///F:/app/git/genealogy_thermo/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  css: {
    postcss: postcss_config_default
  },
  plugins: [react()],
  base: "./",
  resolve: {
    alias: [
      {
        find: /^~.+/,
        replacement: (val) => {
          return val.replace(/^~/, "");
        }
      }
    ]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAicG9zdGNzcy5jb25maWcuanMiLCAic3JjL2Nzcy90YWlsd2luZC5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJGOlxcXFxhcHBcXFxcZ2l0XFxcXGdlbmVhbG9neV90aGVybW9cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkY6XFxcXGFwcFxcXFxnaXRcXFxcZ2VuZWFsb2d5X3RoZXJtb1xcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRjovYXBwL2dpdC9nZW5lYWxvZ3lfdGhlcm1vL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHBvc3Rjc3MgZnJvbSAnLi9wb3N0Y3NzLmNvbmZpZy5qcyc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgY3NzOiB7XHJcbiAgICBwb3N0Y3NzLFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW3JlYWN0KCldLFxyXG4gIGJhc2U6ICcuLycsXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIGZpbmQ6IC9efi4rLyxcclxuICAgICAgICByZXBsYWNlbWVudDogKHZhbCkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIHZhbC5yZXBsYWNlKC9efi8sICcnKTtcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgXSxcclxuICB9LFxyXG59KVxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkY6XFxcXGFwcFxcXFxnaXRcXFxcZ2VuZWFsb2d5X3RoZXJtb1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRjpcXFxcYXBwXFxcXGdpdFxcXFxnZW5lYWxvZ3lfdGhlcm1vXFxcXHBvc3Rjc3MuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9GOi9hcHAvZ2l0L2dlbmVhbG9neV90aGVybW8vcG9zdGNzcy5jb25maWcuanNcIjtpbXBvcnQgdGFpbHdpbmQgZnJvbSBcInRhaWx3aW5kY3NzXCI7XHJcbmltcG9ydCBhdXRvcHJlZml4ZXIgZnJvbSBcImF1dG9wcmVmaXhlclwiO1xyXG5pbXBvcnQgdGFpbHdpbmRDb25maWcgZnJvbSBcIi4vc3JjL2Nzcy90YWlsd2luZC5jb25maWcuanNcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICBwbHVnaW5zOiBbdGFpbHdpbmQodGFpbHdpbmRDb25maWcpLCBhdXRvcHJlZml4ZXJdLFxyXG59OyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRjpcXFxcYXBwXFxcXGdpdFxcXFxnZW5lYWxvZ3lfdGhlcm1vXFxcXHNyY1xcXFxjc3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkY6XFxcXGFwcFxcXFxnaXRcXFxcZ2VuZWFsb2d5X3RoZXJtb1xcXFxzcmNcXFxcY3NzXFxcXHRhaWx3aW5kLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRjovYXBwL2dpdC9nZW5lYWxvZ3lfdGhlcm1vL3NyYy9jc3MvdGFpbHdpbmQuY29uZmlnLmpzXCI7Ly9jb25zdCBwbHVnaW4gPSByZXF1aXJlKCd0YWlsd2luZGNzcy9wbHVnaW4nKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICBjb250ZW50OiBbJy4vaW5kZXguaHRtbCcsICcuL3NyYy8qKi8qLntqcyxqc3gsdHMsdHN4fSddLFxyXG4gIHRoZW1lOiB7XHJcbiAgICBleHRlbmQ6IHtcclxuICAgICAgY29sb3JzOiB7XHJcbiAgICAgICAgcHJpbWFyeTogJyMwMDlCNEEnLFxyXG4gICAgICAgIHNlY29uZGFyeTogJ3JnYmEoMCwxNTUsNzQsMC4xMCknLFxyXG4gICAgICAgIHRoaXJkOiAnIzgzOURFMicsXHJcbiAgICAgICAgaG92ZXI6ICcjMDA5QjRBJyxcclxuICAgICAgICBncmF5OiAncmdiKDE1NiAxNjMgMTc1KScsXHJcbiAgICAgICAgdGV4dFNpZGViYXI6ICdyZ2JhKDM1LCAzMSwgMzIsIDAuNDUpJyxcclxuICAgICAgICBob3ZlclRleHRTaWRlYmFyOiAnIzE1QjA1MycsXHJcbiAgICAgICAgdGV4dEhvdmVyOiAnIzAwOUI0QScsXHJcbiAgICAgICAgZm9jdXNIb3ZlcjogJyMwMDlCNEEnLFxyXG4gICAgICAgIGZvY3VzOiAncmdiKDE0OCAxNjMgMTg0KScsXHJcbiAgICAgICAgYm9yZGVySW5wdXQ6ICcjRTZFNkU2JyxcclxuICAgICAgICB0ZXh0VGFibGVIZWFkZXI6ICdyZ2JhKDQ1LCA0OSwgNTcsIDAuOCknLFxyXG4gICAgICAgIHRleHRUYWJsZUl0ZW06ICcjMkQzMTM5JyxcclxuICAgICAgfSxcclxuICAgICAgYm94U2hhZG93OiB7XHJcbiAgICAgICAgREVGQVVMVDpcclxuICAgICAgICAgICcwIDFweCAzcHggMCByZ2JhKDAsIDAsIDAsIDAuMDgpLCAwIDFweCAycHggMCByZ2JhKDAsIDAsIDAsIDAuMDIpJyxcclxuICAgICAgICBtZDogJzAgNHB4IDZweCAtMXB4IHJnYmEoMCwgMCwgMCwgMC4wOCksIDAgMnB4IDRweCAtMXB4IHJnYmEoMCwgMCwgMCwgMC4wMiknLFxyXG4gICAgICAgIGxnOiAnMCAxMHB4IDE1cHggLTNweCByZ2JhKDAsIDAsIDAsIDAuMDgpLCAwIDRweCA2cHggLTJweCByZ2JhKDAsIDAsIDAsIDAuMDEpJyxcclxuICAgICAgICB4bDogJzAgMjBweCAyNXB4IC01cHggcmdiYSgwLCAwLCAwLCAwLjA4KSwgMCAxMHB4IDEwcHggLTVweCByZ2JhKDAsIDAsIDAsIDAuMDEpJyxcclxuICAgICAgfSxcclxuICAgICAgb3V0bGluZToge1xyXG4gICAgICAgIGJsdWU6ICcycHggc29saWQgcmdiYSgwLCAxMTIsIDI0NCwgMC41KScsXHJcbiAgICAgIH0sXHJcbiAgICAgIGZvbnRGYW1pbHk6IHtcclxuICAgICAgICBpbnRlcjogWydJbnRlcicsICdzYW5zLXNlcmlmJ10sXHJcbiAgICAgICAgd29yazogWydXb3JrIFNhbnMnXSxcclxuICAgICAgfSxcclxuICAgICAgZm9udFNpemU6IHtcclxuICAgICAgICB4czogWycwLjc1cmVtJywgeyBsaW5lSGVpZ2h0OiAnMS41JyB9XSxcclxuICAgICAgICBzbTogWycwLjg3NXJlbScsIHsgbGluZUhlaWdodDogJzEuNTcxNScgfV0sXHJcbiAgICAgICAgYmFzZTogWycxcmVtJywgeyBsaW5lSGVpZ2h0OiAnMS41JywgbGV0dGVyU3BhY2luZzogJy0wLjAxZW0nIH1dLFxyXG4gICAgICAgIGxnOiBbJzEuMTI1cmVtJywgeyBsaW5lSGVpZ2h0OiAnMS41JywgbGV0dGVyU3BhY2luZzogJy0wLjAxZW0nIH1dLFxyXG4gICAgICAgIHhsOiBbJzEuMjVyZW0nLCB7IGxpbmVIZWlnaHQ6ICcxLjUnLCBsZXR0ZXJTcGFjaW5nOiAnLTAuMDFlbScgfV0sXHJcbiAgICAgICAgJzJ4bCc6IFsnMS41cmVtJywgeyBsaW5lSGVpZ2h0OiAnMS4zMycsIGxldHRlclNwYWNpbmc6ICctMC4wMWVtJyB9XSxcclxuICAgICAgICAnM3hsJzogWycxLjg4cmVtJywgeyBsaW5lSGVpZ2h0OiAnMS4zMycsIGxldHRlclNwYWNpbmc6ICctMC4wMWVtJyB9XSxcclxuICAgICAgICAnNHhsJzogWycyLjI1cmVtJywgeyBsaW5lSGVpZ2h0OiAnMS4yNScsIGxldHRlclNwYWNpbmc6ICctMC4wMmVtJyB9XSxcclxuICAgICAgICAnNXhsJzogWyczcmVtJywgeyBsaW5lSGVpZ2h0OiAnMS4yNScsIGxldHRlclNwYWNpbmc6ICctMC4wMmVtJyB9XSxcclxuICAgICAgICAnNnhsJzogWyczLjc1cmVtJywgeyBsaW5lSGVpZ2h0OiAnMS4yJywgbGV0dGVyU3BhY2luZzogJy0wLjAyZW0nIH1dLFxyXG4gICAgICB9LFxyXG4gICAgICBzY3JlZW5zOiB7XHJcbiAgICAgICAgeHM6IFwiNDgwcHhcIixcclxuICAgICAgICBzbTogXCI2NDBweFwiLFxyXG4gICAgICAgIG1kOiBcIjc2OHB4XCIsXHJcbiAgICAgICAgbGc6IFwiMTAyNHB4XCIsXHJcbiAgICAgICAgeGw6IFwiMTI4MHB4XCIsXHJcbiAgICAgICAgXCIyeGxcIjogXCIxNTM2cHhcIlxyXG4gICAgICB9LFxyXG4gICAgICBib3JkZXJXaWR0aDoge1xyXG4gICAgICAgIDM6ICczcHgnLFxyXG4gICAgICB9LFxyXG4gICAgICBtaW5XaWR0aDoge1xyXG4gICAgICAgIDM2OiAnOXJlbScsXHJcbiAgICAgICAgNDQ6ICcxMXJlbScsXHJcbiAgICAgICAgNTY6ICcxNHJlbScsXHJcbiAgICAgICAgNjA6ICcxNXJlbScsXHJcbiAgICAgICAgNzI6ICcxOHJlbScsXHJcbiAgICAgICAgODA6ICcyMHJlbScsXHJcbiAgICAgIH0sXHJcbiAgICAgIG1heFdpZHRoOiB7XHJcbiAgICAgICAgJzh4bCc6ICc4OHJlbScsXHJcbiAgICAgICAgJzl4bCc6ICc5NnJlbScsXHJcbiAgICAgIH0sXHJcbiAgICAgIHpJbmRleDoge1xyXG4gICAgICAgIDYwOiAnNjAnLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBnbG9iYWwtcmVxdWlyZVxyXG4gICAgLy8gcmVxdWlyZSgnQHRhaWx3aW5kY3NzL2Zvcm1zJyksXHJcbiAgICAvLyBhZGQgY3VzdG9tIHZhcmlhbnQgZm9yIGV4cGFuZGluZyBzaWRlYmFyXHJcbiAgICAvLyBwbHVnaW4oKHsgYWRkVmFyaWFudCwgZSB9KSA9PiB7XHJcbiAgICAvLyAgIGFkZFZhcmlhbnQoJ3NpZGViYXItZXhwYW5kZWQnLCAoeyBtb2RpZnlTZWxlY3RvcnMsIHNlcGFyYXRvciB9KSA9PiB7XHJcbiAgICAvLyAgICAgbW9kaWZ5U2VsZWN0b3JzKFxyXG4gICAgLy8gICAgICAgKHsgY2xhc3NOYW1lIH0pID0+XHJcbiAgICAvLyAgICAgICAgIGAuc2lkZWJhci1leHBhbmRlZCAuJHtlKFxyXG4gICAgLy8gICAgICAgICAgIGBzaWRlYmFyLWV4cGFuZGVkJHtzZXBhcmF0b3J9JHtjbGFzc05hbWV9YFxyXG4gICAgLy8gICAgICAgICApfWBcclxuICAgIC8vICAgICApO1xyXG4gICAgLy8gICB9KTtcclxuICAgIC8vIH0pLFxyXG4gIF0sXHJcbn07Il0sCiAgIm1hcHBpbmdzIjogIjtBQUEyUSxTQUFTLG9CQUFvQjs7O0FDQXZCLE9BQU8sY0FBYztBQUN0UyxPQUFPLGtCQUFrQjs7O0FDQ3pCLElBQU8sMEJBQVE7QUFBQSxFQUNiLFNBQVMsQ0FBQyxnQkFBZ0IsNEJBQTRCO0FBQUEsRUFDdEQsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLE1BQ04sUUFBUTtBQUFBLFFBQ04sU0FBUztBQUFBLFFBQ1QsV0FBVztBQUFBLFFBQ1gsT0FBTztBQUFBLFFBQ1AsT0FBTztBQUFBLFFBQ1AsTUFBTTtBQUFBLFFBQ04sYUFBYTtBQUFBLFFBQ2Isa0JBQWtCO0FBQUEsUUFDbEIsV0FBVztBQUFBLFFBQ1gsWUFBWTtBQUFBLFFBQ1osT0FBTztBQUFBLFFBQ1AsYUFBYTtBQUFBLFFBQ2IsaUJBQWlCO0FBQUEsUUFDakIsZUFBZTtBQUFBLE1BQ2pCO0FBQUEsTUFDQSxXQUFXO0FBQUEsUUFDVCxTQUNFO0FBQUEsUUFDRixJQUFJO0FBQUEsUUFDSixJQUFJO0FBQUEsUUFDSixJQUFJO0FBQUEsTUFDTjtB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
