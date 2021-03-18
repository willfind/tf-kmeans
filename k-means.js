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

  _fitWithSeed(x, seedValue){
    assert(x instanceof DataFrame, "`x` must be a DataFrame!")
    assert(isWholeNumber(seedValue), "`seedValue` must be a whole number!")

    seed(seedValue)

    let self = this
    self.centroids = x.shuffle().get(range(0, self.k), null).values
    if (!self.centroids) return false
    if (shape(self.centroids).length === 1) self.centroids = [self.centroids]
    let previousScore = self.score(x, self.predict(x))
    let scoreDelta = -1e20

    for (let i=0; i<self.maxIterations && scoreDelta < 0; i++){
      // assign each point to a centroid
      let labels = self.predict(x)
      let labelsID = makeKey(32)
      let xTemp = x.assign(labelsID, labels)

      // move each centroid to the average location of its assigned points
      for (let i=0; i<self.centroids.length; i++){
        let centroid = self.centroids[i]

        try {
          self.centroids[i] = flatten(
            xTemp.filter(row => row[row.length - 2] === i)
            .drop(null, labelsID)
            .apply(col => [mean(col)])
            .values
          )
        } catch(e){
          return false
        }
      }

      // score
      let newScore = self.score(x, labels)
      scoreDelta = newScore - previousScore
      previousScore = newScore
    }

    return true
  }

  fit(x, callback){
    assert(x instanceof DataFrame, "`x` must be a DataFrame!")
    assert(isUndefined(callback) || typeof(callback) === "function", "`callback` must be undefined or a function!")

    let self = this
    let seedsToTest = round(add(scale(random(self.maxRestarts), 10000), 10000))
    let seedWithBestScore = seedsToTest[0]
    let bestSeedScore = 1e20

    seedsToTest.forEach((seedToTest, i) => {
      let succeeded = self._fitWithSeed(x, seedToTest)
      if (!succeeded) return

      let currentScore = self.score(x)

      if (currentScore < bestSeedScore){
        bestSeedScore = currentScore
        seedWithBestScore = seedToTest
      }

      if (callback) callback(i / self.maxRestarts)
    })

    self._fitWithSeed(x, seedWithBestScore)
    return self
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
