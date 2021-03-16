const missingAwareDistance = require("./missing-aware-distance.js")
const makeKey = require("make-key")
const isWholeNumber = require("./is-whole-number.js")

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
    self.maxIterations = config.maxIterations || 100
    self.centroids = []
    self.maxRestarts = config.maxRestarts || 25
  }

  initializeCentroids(x){
    assert(x instanceof DataFrame, "`x` must be a DataFrame!")

    let self = this
    self.centroids = normal([self.k, x.columns.length])
    return self
  }

  fit(x, seedValue){
    assert(x instanceof DataFrame, "`x` must be a DataFrame!")

    let self = this

    // if there's a seed value, then use it
    if (seedValue){
      // seed with seed value
      seed(seedValue)

      // set centroid starting positions
      self.initializeCentroids(x)

      // for some iterations:
      let previousScore = Infinity

      for (let iteration=0; iteration<self.maxIterations; iteration++){
        // assign each point to a centroid
        let labels = self.predict(x)

        // move the centroids to the mean of their assigned points
        self.centroids.forEach((centroid, i) => {
          let points = x.values.filter((point, j) => labels[j] === i)
          self.centroids[i] = transpose(points).map(row => mean(row))
        })

        // check the score
        let score = self.score(x, labels)

        // if the score is the same or worse, then stop iterating
        if (score >= previousScore) break
        previousScore = score
      }

      return previousScore
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
    assert(x instanceof DataFrame, "`x` must be a DataFrame!")
    assert(isUndefined(labels) || isArray(labels), "`labels` must be undefined or an array of whole numbers!")

    let self = this
    labels = labels || self.predict(x)

    return sum(x.values.map((row, i) => {
      let label = labels[i]
      assert(isWholeNumber(label), "`labels` must be undefined or an array of whole numbers!")

      let centroid = self.centroids[labels[i]]
      return missingAwareDistance(centroid, row)
    })) / x.shape[0]
  }

  predict(x){
    assert(x instanceof DataFrame, "`x` must be a DataFrame!")

    let self = this

    return x.values.map(row => {
      let closestCentroidIndex = 0
      let smallestDistance = Infinity

      self.centroids.forEach((centroid, i) => {
        try {
          let d = missingAwareDistance(centroid, row)

          if (d < smallestDistance){
            smallestDistance = d
            closestCentroidIndex = i
          }
        } catch(e){}
      })

      return closestCentroidIndex
    })
  }
}

module.exports = KMeans
