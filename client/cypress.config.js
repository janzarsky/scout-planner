const { defineConfig } = require("cypress");

module.exports = defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
    video: false,
    supportFile: "cypress/support/component.jsx",
  },
});
