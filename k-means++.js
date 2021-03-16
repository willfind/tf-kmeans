const KMeans = require("./k-means.js")
const isWholeNumber = require("./is-whole-number.js")
const missingAwareDistance = require("./missing-aware-distance.js")

class KMeansPlusPlus extends KMeans {
  initializeCentroids(x){
    assert(x instanceof DataFrame, "`x` must be a DataFrame!")

    let self = this

    // initialize centroids using the kmeans++ algorithm
    // 1a) select a random point from the data to be the first centroid
    let xValues = copy(x.values)
    let index = parseInt(random() * xValues.length)
    let centroids = [xValues[index]]

    // 1b) create a distance cache
    let cache = ndarray([self.k, xValues.length])

    // until we have k centroids:
    while (centroids.length < self.k){
      // 2a) get all of the distances from each point to the closest centroid
      let distances = xValues.map((point, j) => {
        let closestCentroidIndex = 0
        let closestCentroidDistance = Infinity

        centroids.forEach((centroid, i) => {
          let d
          let cachedDistance = cache[i][j]

          if (cachedDistance){
            d = cachedDistance
          } else {
            d = pow(missingAwareDistance(centroid, point), 2)
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

      centroids.push(xValues[index])
    }

    self.centroids = centroids
    return self
  }
}

module.exports = KMeansPlusPlus
