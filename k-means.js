const missingAwareDistance = require("./missing-aware-distance.js")
const makeKey = require("make-key")

class KMeans {
  constructor(k, maxIterations){
    let self = this
    self.k = k
    self.maxIterations = maxIterations || 100
    self.centroids = []
  }

  fit(x){
    assert(x instanceof DataFrame, "`x` must be a DataFrame!")

    let self = this
    x = x.copy()
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

      // print score
      let newScore = self.score(x, labels)
      scoreDelta = newScore - previousScore
      previousScore = newScore
    }

    return self
  }

  score(x, labels){
    assert(x instanceof DataFrame, "`x` must be a DataFrame!")

    let self = this

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
