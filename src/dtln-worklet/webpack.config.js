const path = require("path");

module.exports = {
  entry: path.resolve(__dirname, "noise-suppression-processor.js"),
  output: {
    filename: "dtln-worklet.js",
    path: path.resolve(__dirname, "../../public/javascripts"),
  },
  target: "webworker",
  mode: "production",
  resolve: {
    extensions: [".js"],
  },
};
