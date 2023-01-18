const TFKMeans = {
  helpers: require("./helpers"),
  metrics: require("./metrics"),
  models: require("./models"),
}

if (typeof module !== "undefined") {
  module.exports = TFKMeans
}

if (typeof window !== "undefined") {
  window.TFKMeans = TFKMeans
}
