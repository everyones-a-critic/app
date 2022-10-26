module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'macros',
      'transform-inline-environment-variables',
      ["module:react-native-dotenv"],
      'react-native-reanimated/plugin',
    ],
  };
};