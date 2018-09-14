/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

function getObjValue({ obj, path, err }) {
  const splitted = path.split('.');
  const firstProp = splitted[0];
  if (!firstProp) {
    if (err)
      throw new Error(err);
    return null;
  }

  if (splitted.length === 1) {
    if (obj[firstProp])
      return obj[firstProp];
    if (err)
      throw new Error(err);
    return null;
  }
  return getObjValue({ obj: obj[firstProp], path: splitted.slice(1).join('.'), err });
}

function getConfigValue({ pluginName, path, err }) {
  // Extract a config value = require(the config object for a specific plugin
  // If the value is not found, an error is thrown
  const yanf = require('..');
  const config = yanf.getConfig();
  const plugin = config.plugins[pluginName];
  return getObjValue({ obj: plugin, path, err });
}

module.exports = {
  getConfigValue
};
