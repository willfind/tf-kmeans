const missingAwareDistance = require("./missing-aware-distance.js")
const makeKey = require("make-key")
const isWholeNumber = require("./is-whole-number.js")
const isMatrix = require("./is-matrix.js")

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
    self.centroids = []
    self.maxRestarts = config.maxRestarts || 10
    self.tolerance = 1e-4
  }

  initializeCentroids(x){
    assert(isMatrix(x), "`x` must be a matrix!")

    let self = this
    self.centroids = normal([self.k, x[0].length])
    return self
  }

  fit(x, seedValue){
    assert(isMatrix(x), "`x` must be a matrix!")

    let self = this

    // if there's a seed value, then use it
    if (seedValue){
      // seed with seed value
      seed(seedValue)

      // set centroid starting positions
      self.initializeCentroids(x)

      // for some iterations:
      let previousCentroids = copy(self.centroids)

      for (let iteration=0; iteration<self.maxIterations; iteration++){
        // assign each point to a centroid
        let labels = self.predict(x)

        // move the centroids to the mean of their assigned points
        self.centroids.forEach((centroid, i) => {
          let points = x.filter((point, j) => labels[j] === i)

          if (points.length > 0){
            self.centroids[i] = transpose(points).map(point => mean(point))
          }
        })

        // if the centroids haven't moved, then break
        if (distance(self.centroids, previousCentroids) < self.tolerance){
          break
        }

        // otherwise, record the centroids
        previousCentroids = copy(self.centroids)
      }

      return self.score(x)
    }

    // otherwise, try out a bunch of seed values
    else {
      let seedValues = random(self.maxRestarts).map(v => round(v * 10000) + 10000)
      let bestSeedValue = seedValues[0]
      let bestSeedValueScore = Infinity

      seedValues.forEach(seedValue => {
        try {
          let score = self.fit(x, seedValue)

          if (score < bestSeedValueScore){
            bestSeedValueScore = score
            bestSeedValue = seedValue
          }
        } catch(e){}
      })

      return self.fit(x, bestSeedValue)
    }
  }

  score(x, labels){
    assert(isMatrix(x), "`x` must be a matrix!")
    assert(isUndefined(labels) || isArray(labels), "`labels` must be undefined or an array of whole numbers!")

    let self = this
    labels = labels || self.predict(x)

    return sum(x.map((point, i) => {
      let label = labels[i]
      assert(isWholeNumber(label), "`labels` must be undefined or an array of whole numbers!")

      let centroid = self.centroids[labels[i]]
      return missingAwareDistance(centroid, point)
    })) / x.length
  }

  predict(x){
    assert(isMatrix(x), "`x` must be a matrix!")

    let self = this
    let out = []

    for (let i=0; i<x.length; i++){
      let point = x[i]
      let closestCentroidIndex = 0
      let smallestDistance = Infinity

      for (let j=0; j<self.centroids.length; j++){
        let centroid = self.centroids[j]
        let d = missingAwareDistance(centroid, point)

        if (d < smallestDistance){
          smallestDistance = d
          closestCentroidIndex = j
        }
      }

      out.push(closestCentroidIndex)
    }

    return out
  }
}

module.exports = KMeans
