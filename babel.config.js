const nativewindBabel = require("nativewind/babel").default;
const nativewindPlugins = nativewindBabel().plugins;

module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: nativewindPlugins,
  };
};
