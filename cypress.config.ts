import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      
    },
    specPattern: 'src/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}', // Adjust this if needed
    supportFile: 'src/cypress/support/e2e.ts', // Adjust this path
  },
});
