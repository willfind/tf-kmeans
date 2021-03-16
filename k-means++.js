const KMeans = require("./k-means.js")
const isWholeNumber = require("./is-whole-number.js")
const missingAwareDistance = require("./missing-aware-distance.js")

class KMeansPlusPlus extends KMeans {
  _fitWithSeed(){
    throw new Error("The `_fitWithSeed` method should not be called on a KMeansPlusPlus instance!")
  }

  fit(x, seedValue){
    assert(x instanceof DataFrame, "`x` should be a DataFrame!")
    assert(isUndefined(seedValue) || isWholeNumber(seedValue), "`seedValue` should be undefined or a whole number!")

    let self = this

    // if there's a seed value, then use it
    if (seedValue){
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

      // fit the centroids
      let previousScore = Infinity

      // for each iteration:
      for (let iteration=0; iteration<self.maxIterations; iteration++){
        // assign each point to a centroid
        let labels = self.predict(x)

        // move the centroid to the mean of its assigned points
        self.centroids.forEach((centroid, i) => {
          let points = x.values.filter((point, j) => labels[j] === i)
          self.centroids[i] = transpose(points).map(row => mean(row))
        })

        // score
        let score = self.score(x, labels)
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
}

module.exports = KMeansPlusPlus
