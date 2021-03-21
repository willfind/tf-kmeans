const makeKey = require("make-key")
const tf = require("@tensorflow/tfjs")
const {
  outerSquaredDistances,
  isMatrix,
  isWholeNumber,
  missingAwareSquaredDistance,
  isTFTensor,
} = require("./helpers.js")


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
    self.centroids = null
    self.maxRestarts = config.maxRestarts || 10
    self.tolerance = 1e-4
  }

  initializeCentroids(x, seedValue){
    assert(isMatrix(x), "`x` must be a matrix!")
    assert(isUndefined(seedValue) || isWholeNumber(seedValue), "`seedValue` must be undefined or a whole number!")

    let self = this
    if (seedValue) seed(seedValue)
    self.centroids = tf.tensor(normal([self.k, x[0].length]))
  }

  async fit(x, seedValue){
    assert(isMatrix(x), "`x` must be a matrix!")

    let self = this
    let xTensor = tf.tensor(x)

    if (seedValue){
      self.initializeCentroids(x, seedValue)
      let previousCentroids = self.centroids.clone()
      let failed = false

      for (let iteration=0; iteration<self.maxIterations; iteration++){
        let labels = await self.predict(x)

        self.centroids = tf.stack(range(0, self.k).map(i => {
          let indices = []

          labels.forEach((label, j) => {
            if (label === i) indices.push(j)
          })

          if (indices.length === 0){
            // fail
            failed = true
            return tf.tensor(range(0, x[0].length).map(() => Infinity))
          }

          let points = xTensor.gather(indices)
          return points.mean(0)
        }))

        if (failed) return Infinity
        let d = previousCentroids.sub(self.centroids).pow(2).sum().dataSync()[0]

        if (d < self.tolerance){
          break
        }

        previousCentroids = self.centroids.clone()
      }

      return await self.score(x)
    }

    else {
      let seedValues = random(self.maxRestarts).map(v => round(v * 10000) + 10000)

      let scores = await tf.data.array(seedValues).mapAsync(async (s) => {
        return await self.fit(x, s)
      }).toArray()

      let bestSeed = seedValues[(await tf.argMin(scores).data())[0]]
      return self.fit(x, bestSeed)
    }
  }

  async score(x, labels){
    assert(isMatrix(x), "`x` must be a matrix!")
    assert(isUndefined(labels) || isArray(labels), "`labels` must be undefined or an array of whole numbers!")

    // question: is there a more efficient way of doing this than using labels.dataSync()?
    let self = this

    return new Promise(async (resolve, reject) => {
      try {
        if (isUndefined(labels)) labels = await self.predict(x)
        if (isTFTensor(labels)) labels = labels.dataSync()
        let temp = tf.tensor(x)
        resolve(temp.sub(self.centroids.gather(labels)).pow(2).sum().dataSync()[0])
        temp.dispose()
      } catch(e) {
        return reject(e)
      }
    })
  }

  async predict(x){
    assert(isMatrix(x), "`x` must be a matrix!")

    let self = this

    return await tf.tidy(() => {
      return outerSquaredDistances(x, self.centroids).argMin(1)
    }).array()
  }

  destroy(){
    let self = this
    self.centroids.dispose()
    return null
  }
}

module.exports = KMeans
