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

  fit(x){
    assert(x instanceof DataFrame, "`x` must be a DataFrame!")

    let self = this

    // use kmeans++ to pick starting centroids:
    // 1a) pick a starting centroid from the data set
    let xValues = copy(x.values)
    let index = parseInt(random() * x.index.length)
    self.centroids = [xValues[index]]
    xValues.splice(index, 1)

    // 1b) create a distance cache
    let cache = ndarray([self.k, x.index.length])

    // 2) until we've selected k centroids:
    while (self.centroids.length < self.k){
      // 2a) get the distances from each remaining point to the closest centroid
      let distances = xValues.map((point, j) => {
        let closestCentroidIndex = -1
        let smallestDistance = 1e20

        self.centroids.forEach((centroid, i) => {
          let cachedDistance = cache[i][j]

          if (cachedDistance){
            if (cachedDistance < smallestDistance){
              smallestDistance = cachedDistance
              closestCentroidIndex = i
            }
          } else {
            let d = missingAwareDistance(centroid, point)
            cache[i][j] = d

            if (d < smallestDistance){
              smallestDistance = d
              closestCentroidIndex = i
            }
          }
        })

        return smallestDistance
      })

      // 2b) convert the distances to probabilities
      let totalDistance = sum(distances)
      let probabilities = distances.map(d => d / totalDistance)

      // 2c) select a random point to be the next centroid based on the probabilities
      let r1 = 1
      let r2 = 2
      let index = -1

      while (r2 > r1){
        index = parseInt(random() * probabilities.length)
        r1 = probabilities[index]
        r2 = random()
      }

      self.centroids.push(xValues[index])
      xValues.splice(index, 1)
    }

    // fit centroids to data
    let previousScore = 1e20

    for (let iteration=0; iteration<self.maxIterations; iteration++){
      let labels = self.predict(x)

      self.centroids.forEach((centroid, i) => {
        let points = x.values.filter((row, j) => labels[j] === i)
        self.centroids[i] = transpose(points).map(row => mean(row))
      })

      let score = self.score(x, labels)

      if (score >= previousScore) break
      previousScore = score
    }

    return previousScore
  }

  score(x, labels){
    assert(x instanceof DataFrame, "`x` must be a DataFrame!")

    let self = this
    labels = labels || self.predict(x)

    return sum(x.values.map((row, i) => {
      let centroid = self.centroids[labels[i]]
      return missingAwareDistance(centroid, row)
    })) / x.shape[0]
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
