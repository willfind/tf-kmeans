const tf = require("@tensorflow/tfjs")
const {
  outerSquaredDistances,
  isMatrix,
  isWholeNumber,
  missingAwareSquaredDistance,
  isTFTensor,
} = require("./helpers.js")
const { assert, isUndefined, normal, range } = require("js-math-tools")

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
    return tf.tensor(normal([self.k, x[0].length]))
  }

  fit(x){
    assert(isMatrix(x), "`x` must be a matrix!")

    let self = this

    return tf.tidy(() => {
      let xtf = tf.tensor(x)

      // find best seed value
      let bestScore = Infinity
      let bestCentroids = null

      range(0, self.maxRestarts).forEach(() => {
        // initialize centroids
        let centroids = self.initializeCentroids(x)
        let previousCentroids = centroids.clone()

        // fit centroids
        for (let iteration=0; iteration<self.maxIterations; iteration++){
          // label data points
          let labels = outerSquaredDistances(xtf, centroids).argMin(1).dataSync()

          // adjust centroids
          let temp = []

          for (let i=0; i<self.k; i++){
            let indices = []

            labels.forEach((label, j) => {
              if (label === i) indices.push(j)
            })

            if (indices.length === 0) return
            temp.push(xtf.gather(indices).mean(0))
          }

          centroids = tf.stack(temp)

          // exit early if converges...
          let d = previousCentroids.sub(centroids).pow(2).sum().dataSync()[0]
          if (d < self.tolerance) break
          previousCentroids = centroids.clone()
        }

        // score
        let labels = outerSquaredDistances(xtf, centroids).argMin(1).dataSync()
        let score = centroids.gather(labels).sub(xtf).pow(2).sum().dataSync()[0]

        if (score < bestScore){
          bestScore = score
          bestCentroids = centroids
        }
      })

      // return centroids
      self.centroids = bestCentroids
      return bestCentroids
    })
  }

  score(x){
    assert(isMatrix(x), "`x` must be a matrix!")

    let self = this

    return tf.tidy(() => {
      let labels = self.predict(x)
      let xtf = tf.tensor(x)
      return self.centroids.gather(labels).sub(xtf).pow(2).sum().dataSync()[0]
    })
  }

  predict(x){
    assert(isMatrix(x), "`x` must be a matrix!")

    let self = this

    return tf.tidy(() => {
      return outerSquaredDistances(x, self.centroids).argMin(1).dataSync()
    })
  }

  destroy(){
    let self = this
    self.centroids.dispose()
    return null
  }
}

module.exports = KMeans
