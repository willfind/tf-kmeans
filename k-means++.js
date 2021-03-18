const KMeans = require("./k-means.js")
const isWholeNumber = require("./is-whole-number.js")
const missingAwareDistance = require("./missing-aware-distance.js")
const isMatrix = require("./is-matrix.js")

class KMeansPlusPlus extends KMeans {
  initializeCentroids(x){
    assert(isMatrix(x), "`x` must be a matrix!")

    let self = this

    // initialize centroids using the kmeans++ algorithm
    // 1a) select a random point from the data to be the first centroid
    let index = parseInt(random() * x.length)
    let centroids = [x[index]]

    // 1b) create a distance cache
    let cache = ndarray([self.k, x.length])

    // until we have k centroids:
    while (centroids.length < self.k){
      // 2a) get all of the distances from each point to the closest centroid
      let distances = x.map((point, j) => {
        let closestCentroidIndex = 0
        let closestCentroidDistance = Infinity

        centroids.forEach((centroid, i) => {
          let d
          let cachedDistance = cache[i][j]

          if (cachedDistance){
            d = cachedDistance
          } else {
            d = missingAwareDistance(centroid, point)
            cache[i][j] = d
          }

          if (d < closestCentroidDistance){
            closestCentroidDistance = d
            closestCentroidIndex = i
          }
        })

        return closestCentroidDistance
      })

      // 2b) convert the distances to probabilities
      let totalDistance = sum(distances)
      let probabilities = distances.map(d => d / totalDistance)

      // 2c) use the probabilities to randomly select a point to be the next centroid
      let r1 = 1
      let r2 = 2
      let counter = 0
      index = 0

      while (r2 > r1 && counter < 10000){
        index = parseInt(random() * probabilities.length)
        r1 = probabilities[index]
        r2 = random()
        counter++
      }

      centroids.push(x[index])
    }

    self.centroids = centroids
    return self
  }
}

module.exports = KMeansPlusPlus
