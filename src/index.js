import versionConfig from "./version.json";

const activeVersion = process.env.REACT_APP_VERSION || versionConfig.activeVersion || "v2";

console.log("[Version Switcher] Active Version:", activeVersion);

switch (activeVersion) {
  case "v1":
    require("./v1/index");
    break;
  case "v2":
    require("./v2/index");
    break;
  default:
    require("./v2/index");
    break;
}
