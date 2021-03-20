const makeKey = require("make-key")
const tf = require("@tensorflow/tfjs")
const {
  outerSquaredDistances,
  isMatrix,
  isWholeNumber,
  missingAwareSquaredDistance,
  isTFTensor,
} = require("./helpers.js")


class KMeans {
  constructor(config){
    assert(
      typeof(config) === "object",
      "`config` must be an object with properties `k`, `maxIterations` (optional), and `maxRestarts` (optional)!"
    )

    assert(
      isWholeNumber(config.k),
      "`k` must be a whole number!"
    )

    assert(
      isWholeNumber(config.maxIterations) || isUndefined(config.maxIterations),
      "`maxIterations` must be a whole number or undefined!"
    )

    assert(
      isWholeNumber(config.maxRestarts) || isUndefined(config.maxRestarts),
      "`maxRestarts` must be a whole number or undefined!"
    )

    let self = this
    self.k = config.k
    self.maxIterations = config.maxIterations || 300
    self.centroids = null
    self.maxRestarts = config.maxRestarts || 10
    self.tolerance = 1e-4
  }

  initializeCentroids(x){
    assert(isMatrix(x), "`x` must be a matrix!")

    let self = this
    self.centroids = tf.tensor(normal([self.k, x[0].length]))
    return self
  }

  async fit(x, seedValue){
    assert(isMatrix(x), "`x` must be a matrix!")
    assert(isUndefined(seedValue) || isWholeNumber(seedValue), "`seedValue` must be undefined or a whole number!")

    let self = this
    return self
  }

  async score(x, labels){
    assert(isMatrix(x), "`x` must be a matrix!")
    assert(isUndefined(labels) || isArray(labels), "`labels` must be undefined or an array of whole numbers!")

    // question: is there a more efficient way of doing this than using labels.dataSync()?
    let self = this

    return await tf.tidy(() => {
      if (!isTFTensor(x)) x = tf.tensor(x)
      if (isUndefined(labels)) labels = self.predict(x)
      if (isTFTensor(labels)) labels = labels.dataSync()
      return x.sub(self.centroids.gather(labels)).pow(2).sum()
    }).data()[0]
  }

  async predict(x){
    assert(isMatrix(x), "`x` must be a matrix!")

    let self = this

    return await tf.tidy(() => {
      return outerSquaredDistances(x, self.centroids).argMin(1)
    }).array()
  }

  destroy(){
    let self = this
    self.centroids.dispose()
    return null
  }
}

module.exports = KMeans
