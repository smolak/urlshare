module.exports = {
  root: true,
  // This tells ESLint to load the config from the package with base configuration
  extends: ["@urlshare/eslint-config"],
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
};
