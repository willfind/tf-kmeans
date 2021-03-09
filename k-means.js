const missingAwareDistance = require("./missing-aware-distance.js")
const makeKey = require("make-key")

function isWholeNumber(x){
  return isNumber(x) && parseInt(x) === x && x >= 0
}

class KMeans {
  constructor(k, maxIterations, maxRestarts){
    assert(isWholeNumber(k), "`k` must be a whole number!")
    assert(isWholeNumber(maxIterations) || isUndefined(maxIterations), "`maxIterations` must be a whole number or undefined!")
    assert(isWholeNumber(maxRestarts) || isUndefined(maxRestarts), "`maxRestarts` must be a whole number or undefined!")

    let self = this
    self.k = k
    self.maxIterations = maxIterations || 100
    self.centroids = []
    self.maxRestarts = maxRestarts || 25
  }

  _fitWithSeed(x, seedValue){
    assert(x instanceof DataFrame, "`x` must be a DataFrame!")
    assert(isWholeNumber(seedValue), "`seedValue` must be a whole number!")

    seed(seedValue)

    let self = this
    self.centroids = normal([self.k, x.shape[1]])
    let previousScore = self.score(x, self.predict(x))
    let scoreDelta = -1e20

    for (let i=0; i<self.maxIterations && scoreDelta < 0; i++){
      // assign each point to a centroid
      let labels = self.predict(x)
      let labelsID = makeKey(32)
      let xTemp = x.assign(labelsID, labels)

      // move each centroid to the average location of its assigned points
      self.centroids.forEach((centroid, i) => {
        try {
          self.centroids[i] = flatten(
            xTemp.filter(row => row[row.length - 2] === i)
            .drop(null, labelsID)
            .apply(col => [mean(col)])
            .values
          )
        } catch(e){}
      })

      // score
      let newScore = self.score(x, labels)
      scoreDelta = newScore - previousScore
      previousScore = newScore
    }

    return self
  }

  fit(x){
    assert(x instanceof DataFrame, "`x` must be a DataFrame!")

    let self = this
    x = x.copy()

    let seedsToTest = round(add(scale(random(self.maxRestarts), 10000), 10000))
    let seedWithBestScore = seedsToTest[0]
    let bestSeedScore = 1e20

    seedsToTest.forEach(seedToTest => {
      self._fitWithSeed(x, seedToTest)
      let currentScore = self.score(x)

      if (currentScore < bestSeedScore){
        bestSeedScore = currentScore
        seedWithBestScore = seedToTest
      }
    })

    self._fitWithSeed(x, seedWithBestScore)
    return self
  }

  score(x, labels){
    assert(x instanceof DataFrame, "`x` must be a DataFrame!")

    let self = this
    labels = labels || self.predict(x)

    return sum(x.values.map((row, i) => {
      let centroid = self.centroids[labels[i]]
      return missingAwareDistance(centroid, row)
    }))
  }

  predict(x){
    assert(x instanceof DataFrame, "`x` must be a DataFrame!")

    let self = this

    return x.values.map(row => {
      let closestCentroidIndex = -1
      let smallestDistance = 1e20

      self.centroids.forEach((centroid, i) => {
        let d = missingAwareDistance(centroid, row)

        if (d < smallestDistance){
          smallestDistance = d
          closestCentroidIndex = i
        }
      })

      return closestCentroidIndex
    })
  }
}

module.exports = KMeans
