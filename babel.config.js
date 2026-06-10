module.exports = function (api) {
  api.cache(true)
  return {
    // babel-preset-expo auto-includes the react-native-worklets/reanimated plugin
    // when react-native-reanimated is installed.
    presets: ['babel-preset-expo'],
  }
}
