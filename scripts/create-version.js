const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const pkgPath = path.join(__dirname, '..', 'package.json');
const versionJsonPath = path.join(srcDir, 'version.json');

// Helper to safely copy folder/file on Windows
function safeCopy(src, dest) {
  fs.cpSync(src, dest, { recursive: true, force: true });
}

// Helper to safely remove folder/file
function safeRemove(targetPath) {
  try {
    fs.rmSync(targetPath, { recursive: true, force: true });
  } catch (err) {
    console.warn(`Warning: Could not remove ${targetPath}: ${err.message}`);
  }
}

// 1. Move root src items into src/v1 if src/v1 doesn't have the full codebase yet
const v1Dir = path.join(srcDir, 'v1');
if (!fs.existsSync(v1Dir)) {
  fs.mkdirSync(v1Dir, { recursive: true });
}

const itemsInSrc = fs.readdirSync(srcDir);
const isV1Populated = fs.existsSync(path.join(v1Dir, 'components'));

if (!isV1Populated) {
  console.log('📦 Initializing v1 baseline in src/v1...');
  for (const item of itemsInSrc) {
    if (/^v\d+$/.test(item) || item === 'version.json' || item === 'index.js') continue;
    const itemSrc = path.join(srcDir, item);
    const itemDest = path.join(v1Dir, item);
    safeCopy(itemSrc, itemDest);
    safeRemove(itemSrc);
  }

  // Copy index.js to v1 if v1/index.js does not exist
  const rootIndexJs = path.join(srcDir, 'index.js');
  const v1IndexJs = path.join(v1Dir, 'index.js');
  if (fs.existsSync(rootIndexJs) && !fs.existsSync(v1IndexJs)) {
    safeCopy(rootIndexJs, v1IndexJs);
  }
  console.log('✅ Baseline v1 initialized inside src/v1.');
}

// 2. Detect existing versions
const existingVersions = fs.readdirSync(srcDir)
  .filter(name => /^v\d+$/.test(name) && fs.statSync(path.join(srcDir, name)).isDirectory())
  .sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10));

if (existingVersions.length === 0) {
  existingVersions.push('v1');
}

const latestVerStr = existingVersions[existingVersions.length - 1];
const latestNum = parseInt(latestVerStr.slice(1), 10);
const nextVerNum = latestNum + 1;
const nextVerStr = `v${nextVerNum}`;

console.log(`📋 Copying ${latestVerStr} -> ${nextVerStr}...`);

const latestDir = path.join(srcDir, latestVerStr);
const nextDir = path.join(srcDir, nextVerStr);

safeCopy(latestDir, nextDir);
console.log(`✅ Created ${nextVerStr} from ${latestVerStr}.`);

// 3. Update src/version.json
const allVersions = [...existingVersions, nextVerStr];
const versionConfig = {
  activeVersion: nextVerStr,
  availableVersions: allVersions,
  updatedAt: new Date().toISOString()
};

fs.writeFileSync(versionJsonPath, JSON.stringify(versionConfig, null, 2));
console.log(`✅ Updated src/version.json (active: ${nextVerStr}).`);

// Update version.json in tab if present
const tabVersionPath = path.join(nextDir, 'components', 'AccountCenter', 'tabs', 'version.json');
if (fs.existsSync(tabVersionPath)) {
  fs.writeFileSync(tabVersionPath, JSON.stringify({ version: nextVerStr }, null, 2));
}

// 4. Update src/index.js root entry switcher
const caseBlocks = allVersions.map(ver => `  case "${ver}":\n    require("./${ver}/index");\n    break;`).join('\n');

const indexJsContent = `import versionConfig from "./version.json";

const activeVersion = process.env.REACT_APP_VERSION || versionConfig.activeVersion || "${nextVerStr}";

console.log("[Version Switcher] Active Version:", activeVersion);

switch (activeVersion) {
${caseBlocks}
  default:
    require("./${nextVerStr}/index");
    break;
}
`;

fs.writeFileSync(path.join(srcDir, 'index.js'), indexJsContent);
console.log(`✅ Updated src/index.js entry switcher.`);

// 5. Update package.json scripts
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

pkg.scripts = pkg.scripts || {};
pkg.scripts["version"] = "node scripts/create-version.js";
pkg.scripts["version:create"] = "node scripts/create-version.js";

allVersions.forEach(ver => {
  pkg.scripts[`start:${ver}`] = `cross-env REACT_APP_VERSION=${ver} react-app-rewired start`;
  pkg.scripts[`build:${ver}`] = `cross-env REACT_APP_VERSION=${ver} GENERATE_SOURCEMAP=false react-app-rewired --max_old_space_size=6144 build`;
});

pkg.scripts["build"] = `cross-env REACT_APP_VERSION=${nextVerStr} GENERATE_SOURCEMAP=false react-app-rewired --max_old_space_size=6144 build`;

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log(`✅ Updated package.json with scripts for ${nextVerStr}.`);

console.log(`\n🎉 Success! ${nextVerStr} created and configured as active version.`);
console.log(`👉 Run "npm start" or "npm run start:${nextVerStr}" to launch ${nextVerStr}.`);
console.log(`👉 Run "npm run build:${latestVerStr}" to build ${latestVerStr} or "npm run build:${nextVerStr}" to build ${nextVerStr}.`);
