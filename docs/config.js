// Configure your GitHub repo details for fetching raw Markdown
// 1) Replace YOUR_GH_OWNER and YOUR_REPO with your GitHub username/org and repo name
// 2) If your default branch is not 'main', change it
// This file is loaded before app.js

window.SITE_CONFIG = {
  owner: 'cruxsucks',
  repo: 'exposed',
  branch: 'master'
};

(function autoWarn() {
  const needsConfig = !window.SITE_CONFIG ||
    window.SITE_CONFIG.owner === 'YOUR_GH_OWNER' ||
    window.SITE_CONFIG.repo === 'YOUR_REPO';
  if (needsConfig) {
    console.warn('[Config] Please edit docs/config.js with your GitHub owner/repo.');
  }
})();

