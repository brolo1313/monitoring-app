const path = require("path");

function loadAppUrl(window, localEnv, buildEnv, isLocal) {
  const url = isLocal ? localEnv : buildEnv;

  if (isLocal) {
    require("electron-reloader")(module);
    window.webContents.openDevTools();
  }
  window.loadURL(url).catch((error) => {
    console.error("Failed to load URL:", error);
    // Optionally load a fallback page
    window.loadFile(path.join(__dirname, "../../dist/browser/index.html"));
  });
}

function getEnvUrls() {
  const isLocalTest = process.env.npm_lifecycle_event === "test-local";
  const localEnv = "http://localhost:4200";
  const buildEnv = `file://${path.join(
    __dirname,
    "../../dist/browser/index.html"
  )}`;
  return { localEnv, buildEnv, isLocalTest };
}

module.exports = { loadAppUrl, getEnvUrls };
