"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = require("path");

var _plugin = require("@parcel/plugin");

var _package = require("../package.json");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// Plugin configuration importer.
let projectPackagePromise = null;

const getPluginConfig = projectRoot => {
  // Import only once.
  if (projectPackagePromise == null) {
    projectPackagePromise = Promise.resolve(`${(0, _path.join)(projectRoot, 'package.json')}`).then(s => _interopRequireWildcard(require(s))).then(pkgConfig => Object.entries(pkgConfig[_package.name] || {}).map(([srcPattern, destPattern]) => [new RegExp(srcPattern, 'i'), destPattern]));
  }

  return projectPackagePromise;
}; // Exports.


var _default = new _plugin.Namer({
  async name({
    bundle,
    logger,
    options
  }) {
    // Return if a target specified an output path.
    if (bundle.filePath != null) {
      return bundle.filePath;
    }

    const {
      filePath: bundlePath
    } = bundle.getMainEntry();
    const {
      projectRoot
    } = options;
    const pluginConfig = await getPluginConfig(projectRoot); // Walk through matchers until first hit, top to bottom.

    for (let i = 0; i < pluginConfig.length; i += 1) {
      const [srcPattern, destPattern] = pluginConfig[i];
      const match = bundlePath.match(srcPattern);

      if (match !== null) {
        const filePath = (0, _path.relative)(projectRoot, bundlePath);
        const parsed = (0, _path.parse)(filePath); // Replace all macros except [hash], as this is an internal Parcel macro
        // we don't want to log.

        const result = destPattern.replace(/\[dir\]/gi, parsed.dir).replace(/\[folder\]/gi, (0, _path.basename)(parsed.dir)).replace(/\[base\]/gi, parsed.base).replace(/\[ext\]/gi, parsed.ext.substring(1)) // Remove leading "."
        .replace(/\[name\]/gi, parsed.name).replace(/\[type\]/gi, bundle.type).replace(/\[(\d+)\]/g, (original, n) => {
          const idx = parseInt(n, 10);
          return idx < match.length ? match[idx] : original;
        }); // Log replacement.

        logger.info({
          message: `${filePath} → ${result}`,
          filePath: bundlePath,
          language: bundle.type
        }); // Return the result, with [hash] replaced this time.

        return result.replace(/\[hash\]/gi, bundle.hashReference);
      }
    } // No match, continue with next namer.


    return null;
  }

});

exports.default = _default;