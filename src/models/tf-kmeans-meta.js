const {
  assert,
  isFunction,
  isEqual,
  isUndefined,
  shape,
} = require("@jrc03c/js-math-tools")

const { KMeansMeta } = require("@jrc03c/js-data-science-helpers").KMeans
const { isTFTensor } = require("../helpers")
const TFKMeansPlusPlus = require("./tf-kmeans-plus-plus")

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

  get centroids() {
    const self = this

    if (self.fittedModel) {
      return self.fittedModel.centroids
    } else {
      return self._fitState.bestCentroids
    }
  }

  set centroids(centroids) {
    const self = this

    if (isTFTensor(centroids)) {
      centroids = centroids.arraySync()
    }

    const newShape = shape(centroids)

    if (self.centroids) {
      const oldCentroids = self.centroids.arraySync()
      const oldShape = shape(oldCentroids)

      assert(
        isEqual(newShape, oldShape),
        `The new centroids must have the same shape as the old centroids! (expected: [${oldShape.join(
          ", "
        )}], received: [${newShape.join(", ")}])`
      )
    }

    if (!self.fittedModel) {
      self.fittedModel = new self.modelClass({
        k: newShape[0],
        maxIterations: self.maxIterations,
        maxRestarts: self.maxRestarts,
        tolerance: self.tolerance,
      })
    }

    self.fittedModel.centroids = centroids
  }
}

module.exports = TFKMeansMeta
