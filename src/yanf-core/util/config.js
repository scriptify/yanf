function finalizeConfigValues(config, mode) {
  const retObj = {};
  Object.keys(config).forEach((key) => {
    const currVal = config[key];
    if (typeof currVal === 'object' && !Array.isArray(currVal)) {
      if (currVal.prod && currVal.dev)
        retObj[key] = currVal[mode];
      else
        retObj[key] = finalizeConfigValues(config[key], mode);
    } else
      retObj[key] = config[key];
  });
  return retObj;
}

module.exports = function getConfig(configObj) {
  // Extract config based on production/dev env
  const mode = process.env.ANF_MODE === 'production' ? 'prod' : 'dev';
  return finalizeConfigValues(configObj, mode);
};
