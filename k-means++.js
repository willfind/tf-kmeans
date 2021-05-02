const KMeans = require("./k-means.js")
const tf = require("@tensorflow/tfjs")
const { isWholeNumber, missingAwareSquaredDistance, outerSquaredDistances, isMatrix } = require("./helpers.js")
const { argmin, assert, int, random } = require("js-math-tools")

class KMeansPlusPlus extends KMeans {
  initializeCentroids(x){
    assert(isMatrix(x), "`x` must be a matrix!")

    // initialize centroids using the kmeans++ algorithm
    // 1) select a random point from the data to be the first centroid
    // until we have k centroids:
      // 2a) get all of the distances from each point to the closest centroid
      // 2b) convert the distances to probabilities
      // 2c) use the probabilities to randomly select a point to be the next centroid

    let self = this

    return tf.tidy(() => {
      let xtf = tf.tensor(x)

      // for now, the "centroids" array will just be a list of indices into x;
      // later, we'll map those to actual points
      let centroids = [int(random() * x.length)]

      while (centroids.length < self.k){
        let centroidsTemp = centroids.map(i => x[i])
        let labels = outerSquaredDistances(x, centroidsTemp).argMin(1).dataSync()

        let distances = tf.tidy(() => {
          return tf.tensor(centroidsTemp).gather(labels).sub(xtf).pow(2).sum(1)
        })

        let probabilities = distances.div(distances.max()).dataSync()
        let index = 0

        for (let i=0; i<10000; i++){
          index = int(random() * probabilities.length)
          let r1 = probabilities[index]
          let r2 = random()

          if (r2 < r1){
            break
          }
        }

        centroids.push(index)
      }

      return tf.tensor(centroids.map(i => x[i]))
    })
  }
}

module.exports = KMeansPlusPlus
