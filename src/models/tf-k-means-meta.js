const { assert, isFunction, isUndefined } = require("@jrc03c/js-math-tools")
const { KMeansMeta } = require("@jrc03c/js-data-science-helpers").KMeans
const TFKMeansPlusPlus = require("./tf-k-means-plus-plus")

class TFKMeansMeta extends KMeansMeta {
  constructor(config) {
    super(config)

    if (isUndefined(config)) {
      config = {}
    }

    assert(
      isFunction(config.modelClass) || isUndefined(config.modelClass),
      "`class` should be a class, a function, or undefined!"
    )

    const self = this
    self.modelClass = config.modelClass || TFKMeansPlusPlus
  }
}

module.exports = TFKMeansMeta
