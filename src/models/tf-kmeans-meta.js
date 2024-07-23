const { assert, isEqual, shape } = require("@jrc03c/js-math-tools")
const { KMeansMeta } = require("@jrc03c/js-data-science-helpers").KMeans
const { isTFTensor } = require("../helpers")
const TFKMeansPlusPlus = require("./tf-kmeans-plus-plus")

class TFKMeansMeta extends KMeansMeta {
  constructor(config) {
    super(config)

    config = config || {}
    this.modelClass = config.modelClass || TFKMeansPlusPlus
  }

  get centroids() {
    if (this.fittedModel) {
      return this.fittedModel.centroids
    } else {
      return this._fitState.bestCentroids
    }
  }

  set centroids(centroids) {
    if (isTFTensor(centroids)) {
      centroids = centroids.arraySync()
    }

    const newShape = shape(centroids)

    if (this.centroids) {
      const oldCentroids = this.centroids
      const oldShape = shape(oldCentroids)

      assert(
        isEqual(newShape, oldShape),
        `The new centroids must have the same shape as the old centroids! (expected: [${oldShape.join(
          ", "
        )}], received: [${newShape.join(", ")}])`
      )
    }

    if (!this.fittedModel) {
      this.fittedModel = new this.modelClass({
        k: newShape[0],
        maxIterations: this.maxIterations,
        maxRestarts: this.maxRestarts,
        tolerance: this.tolerance,
      })
    }

    this.fittedModel.centroids = centroids
  }
}

module.exports = TFKMeansMeta
