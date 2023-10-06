const config = require("@urlshare/tailwind-config/tailwind.config.js");

module.exports = {
  ...config,
  content: [
    "./popup/**/*.{js,ts,jsx,tsx}",
    // include packages if not transpiling
    "../../packages/**/*.{js,ts,jsx,tsx}",
  ],
};
