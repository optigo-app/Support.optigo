const fs = require("fs");
const path = require("path");

const packageJsonPath = path.join(__dirname, "../package.json");
const requestedVersion = process.argv[2] || process.env.REACT_APP_VERSION;

try {
  const appVersion = requestedVersion ||
    JSON.parse(fs.readFileSync(path.join(__dirname, "../src/version.json"), "utf8")).activeVersion;
  const normalizedAppVersion = String(appVersion || "v2").replace(/^v/i, "");
  if (!["v1", "v2"].includes(`v${normalizedAppVersion}`)) {
    throw new Error(`Unsupported app version: ${appVersion}`);
  }

  const versionJsonPath = path.join(
    __dirname,
    `../src/v${normalizedAppVersion}/components/AccountCenter/tabs/version.json`,
  );
  if (!fs.existsSync(versionJsonPath)) {
    throw new Error(`Version file does not exist: ${versionJsonPath}`);
  }

  // 1. Read package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  // 2. Determine and increment version
  let currentVersion = packageJson.version || "4.0.0";
  // If version is 0.1.0, let's bump it directly to 4.0.0 for the start of this system
  if (currentVersion === "0.1.0") {
    currentVersion = "4.0.0";
  }

  let parts = currentVersion.split(".");
  if (parts.length === 3) {
    const patch = parseInt(parts[2], 10);
    parts[2] = isNaN(patch) ? 0 : patch + 1;
  } else {
    parts = ["4", "0", "0"];
  }
  const newVersion = parts.join(".");

  const versionData = {
    version: `v${newVersion}`,
  };

  // Keep the active app's support version and public update endpoint aligned.
  fs.writeFileSync(
    versionJsonPath,
    JSON.stringify(versionData, null, 2),
    "utf8",
  );

  const publicDir = path.join(__dirname, "../public");
  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(
    path.join(publicDir, "version.json"),
    JSON.stringify({ ...versionData, buildTime: new Date().toISOString() }, null, 2),
    "utf8",
  );

  // Write package.json last so a failed generated-file write cannot advance the bundle version alone.
  packageJson.version = newVersion;
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, "\t") + "\n",
    "utf8",
  );

  console.log(`[Version Control] Bumped version to ${newVersion}`);
} catch (error) {
  console.error("[Version Control] Error running prebuild version bump:", error);
  process.exit(1);
}
