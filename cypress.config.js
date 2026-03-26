const fs = require('fs');
const path = require('path');
const { defineConfig } = require('cypress');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const {
  addCucumberPreprocessorPlugin,
} = require('@badeball/cypress-cucumber-preprocessor');
const {
  createEsbuildPlugin,
} = require('@badeball/cypress-cucumber-preprocessor/esbuild');
const { beforeRunHook, afterRunHook } = require('cypress-mochawesome-reporter/lib');

function writeCiMetadata(results) {
  const reportsDir = path.join(__dirname, 'cypress', 'reports');
  const metadataPath = path.join(reportsDir, 'ci-metadata.json');
  const totalTests = (results?.totalPassed || 0)
    + (results?.totalFailed || 0)
    + (results?.totalPending || 0)
    + (results?.totalSkipped || 0);

  fs.mkdirSync(reportsDir, { recursive: true });

  fs.writeFileSync(
    metadataPath,
    JSON.stringify({
      environment: process.env.REPORT_OS || process.env.RUNNER_OS || process.platform,
      browserName: results?.browserName || 'unknown',
      browserVersion: results?.browserVersion || 'unknown',
      startedTestsAt: results?.startedTestsAt || null,
      endedTestsAt: results?.endedTestsAt || null,
      status: results?.totalFailed ? 'failed' : 'passed',
      totalTests,
      totalPassed: results?.totalPassed || 0,
      totalFailed: results?.totalFailed || 0,
      totalPending: results?.totalPending || 0,
      totalSkipped: results?.totalSkipped || 0,
      totalSuites: results?.totalSuites || 0,
      totalDuration: results?.totalDuration || 0,
      screenshots: results?.totalScreenshots || 0,
      runs: (results?.runs || []).map((run) => ({
        spec: run.spec?.relative || run.spec?.name || 'unknown',
        stats: run.stats || {},
        reporterStats: run.reporterStats || {},
      })),
      runUrl: process.env.GITHUB_SERVER_URL
        && process.env.GITHUB_REPOSITORY
        && process.env.GITHUB_RUN_ID
        ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
        : null,
    }, null, 2),
  );
}

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
    json: true,
    reportDir: 'cypress/reports/html',
    reportFilename: 'execution-report',
    saveAllAttempts: false,
  },
  e2e: {
    baseUrl: 'https://blog.agibank.com.br',
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    retries: {
      runMode: 1,
      openMode: 0,
    },
    screenshotsFolder: 'cypress/screenshots',
    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config);

      on(
        'file:preprocessor',
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        }),
      );

      on('before:run', async (details) => {
        await beforeRunHook(details);
      });

      on('after:run', async (results) => {
        await afterRunHook();
        writeCiMetadata(results);
      });

      return config;
    },
    specPattern: 'cypress/e2e/feature/**/*.feature',
    supportFile: 'cypress/support/e2e.js',
    viewportHeight: 900,
    viewportWidth: 1440,
    video: false,
  },
});