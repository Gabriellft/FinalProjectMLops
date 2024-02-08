module.exports = {
    transform: {
      "^.+\\.[t|j]sx?$": "babel-jest"
    },
  };

module.exports = {
transformIgnorePatterns: [
    "/node_modules/(?!axios).+\\.js$"
],
};
  