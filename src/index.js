// Standard lib.
import {
  basename,
  join as joinPath,
  parse as parsePath,
  relative as relativePath,
} from 'path';

// Package modules.
import { Namer } from '@parcel/plugin';

// Local modules.
import { name as pluginName } from '../package.json';

// Plugin configuration importer.
let projectPackagePromise = null;
const getPluginConfig = (projectRoot) => {
  // Import only once.
  if (projectPackagePromise == null) {
    projectPackagePromise = import(joinPath(projectRoot, 'package.json'))
      .then((pkgConfig) => Object
        .entries(pkgConfig[pluginName] || {})
        .map(([srcPattern, destPattern]) => ([
          new RegExp(srcPattern, 'i'),
          destPattern,
        ])));
  }
  return projectPackagePromise;
};

// Exports.
export default new Namer({
  async name({ bundle, logger, options }) {
    // Return if a target specified an output path.
    if (bundle.filePath != null) {
      return bundle.filePath;
    }

    const { filePath: bundlePath } = bundle.getMainEntry();
    const { projectRoot } = options;
    const pluginConfig = await getPluginConfig(projectRoot);

    // Walk through matchers until first hit, top to bottom.
    for (let i = 0; i < pluginConfig.length; i += 1) {
      const [srcPattern, destPattern] = pluginConfig[i];
      const match = bundlePath.match(srcPattern);
      if (match !== null) {
        const filePath = relativePath(projectRoot, bundlePath);
        const parsed = parsePath(filePath);

        // Replace all macros except [hash], as this is an internal Parcel macro
        // we don't want to log.
        const result = destPattern
          .replace(/\[dir\]/gi, parsed.dir)
          .replace(/\[folder\]/gi, basename(parsed.dir))
          .replace(/\[base\]/gi, parsed.base)
          .replace(/\[ext\]/gi, parsed.ext.substring(1)) // Remove leading "."
          .replace(/\[name\]/gi, parsed.name)
          .replace(/\[type\]/gi, bundle.type)
          .replace(/\[(\d+)\]/g, (original, n) => {
            const idx = parseInt(n, 10);
            return idx < match.length ? match[idx] : original;
          });

        // Log replacement.
        logger.info({
          message: `${filePath} → ${result}`,
          filePath: bundlePath,
          language: bundle.type,
        });

        // Return the result, with [hash] replaced this time.
        return result
          .replace(/\[hash\]/gi, bundle.hashReference);
      }
    }

    // No match, continue with next namer.
    return null;
  },
});
