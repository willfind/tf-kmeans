const {
  assert,
  isDataFrame,
  isEqual,
  isFunction,
  isUndefined,
  shape,
} = require("@jrc03c/js-math-tools")

const { KMeansMeta } = require("@jrc03c/js-data-science-helpers").KMeans
const { isMatrix, isTFTensor } = require("../helpers")
const TFKMeansPlusPlus = require("./tf-kmeans-plus-plus")

class TFKMeansMeta extends KMeansMeta {
  constructor(config) {
    super(config)

    config = config || {}
    this.modelClass = config.modelClass || TFKMeansPlusPlus
  }

  get centroids() {
    return this.fittedModel.centroids
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

  async fit(x, progress) {
    const fitStep = this.getFitStepFunction(x, progress)
    let state

    while (!state || !state.isFinished) {
      state = await fitStep()
    }

    return this
  }

  getFitStepFunction(x, progress) {
    // currently, this method uses the "elbow" method of determining when to
    // stop; but we should probably consider the "silhouette" method as well!

    assert(isMatrix(x), "`x` must be a matrix!")

    if (isDataFrame(x)) {
      x = x.values
    }

    if (!isUndefined(progress)) {
      assert(isFunction(progress), "If defined, `progress` must be a function!")
    }

    const state = {
      isFinished: false,
      lastScore: -Infinity,
      currentIndex: 0,
    }

    return async () => {
      const k = this.ks[state.currentIndex]

      const model = new this.modelClass({
        k,
        maxRestarts: 10,
        maxIterations: 20,
      })

      await model.fit(x, p =>
        progress
          ? progress((state.currentIndex + p) / (this.ks.length + 1))
          : null
      )

      const score = model.score(x)

      if (score / state.lastScore > this.scoreStopRatio) {
        state.isFinished = true
        state.currentIndex--
      } else {
        state.lastScore = score

        if (state.currentIndex + 1 >= this.ks.length) {
          state.isFinished = true
        } else {
          state.currentIndex++
        }
      }

      if (state.isFinished) {
        this.fittedModel = new this.modelClass({
          k: this.ks[state.currentIndex],
          maxRestarts: this.maxRestarts,
          maxIterations: this.maxIterations,
        })

        await this.fittedModel.fit(x, p =>
          progress
            ? progress((this.ks.length + p) / (this.ks.length + 1))
            : null
        )

        if (progress) {
          progress(1)
        }
      }

      return state
    }
  }
}

module.exports = TFKMeansMeta
