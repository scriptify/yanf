/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import yanf from '../../../yanf-core';

const { getConfigValue } = require('../../../yanf-core/util/app');

const availableLanguages = getConfigValue({ pluginName: 'intl', path: 'availableLanguages' });
const langConstants = availableLanguages
  .map(lang => ({ constants: require(lang.file), key: lang.iso }));

const languages = {};

langConstants.forEach((lang) => {
  languages[lang.key] = lang.constants;
});

function getValueStatic({ key, lang }) {
  const langObj = languages[lang];
  if (!langObj)
    return null;
  return langObj[key];
}

module.exports = async function getValue({ key, lang }) {
  let data;

  if (key && lang)
    data = getValueStatic({ key, lang }); // First look if it is an internal lang constant

  if (!data) // If not, it is an intl word saved in the DB by the admins
    data = await yanf.model('IntlWord').get({ key, lang });
  return data;
};
