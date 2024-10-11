import { assert, float, int, random } from "@jrc03c/js-math-tools"
import { isMatrix, isTFTensor } from "../helpers.mjs"
import { tensor, tidy } from "@tensorflow/tfjs"
import { TFKMeansNaive } from "./tf-kmeans-naive.mjs"

class TFKMeansPlusPlus extends TFKMeansNaive {
  initializeCentroids(x) {
    if (!isTFTensor(x)) {
      x = float(x)
    }

    assert(isMatrix(x), "`x` must be a matrix!")

    // initialize centroids using the kmeans++ algorithm
    // 1) select a random point from the data to be the first centroid
    // 2) until we have k centroids:
    //    a) get all of the distances from each point to the closest centroid
    //    b) convert the distances to probabilities
    //    c) use the probabilities to randomly select a point to be the next
    //       centroid

    return tidy(() => {
      const xtf = tensor(x)

      // for now, the "centroids" array will just be a list of indices into x;
      // later, we'll map those to actual points
      const centroids = [int(random() * x.length)]

      while (centroids.length < this.k) {
        const centroidsTemp = centroids.map(i => x[i])
        const labels = tensor(this.predict(x, centroidsTemp), null, "int32")

        const distances = tidy(() => {
          return tensor(centroidsTemp).gather(labels).sub(xtf).pow(2).sum(1)
        })

        const probabilities = distances.div(distances.max()).arraySync()
        let index = 0

        for (let i = 0; i < 10000; i++) {
          index = int(random() * probabilities.length)
          const r1 = probabilities[index]
          const r2 = random()

          if (r2 < r1) {
            break
          }
        }

        centroids.push(index)
      }

      return tensor(centroids.map(i => x[i]))
    })
  }
}

export { TFKMeansPlusPlus }
