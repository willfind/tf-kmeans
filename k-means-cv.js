const KMeans = require("./k-means.js")
const isWholeNumber = require("./is-whole-number.js")

class KMeansCV {
  constructor(config){
    assert(
      typeof(config) === "object",
      "`config` should be an object with properties `kValues`, `maxIterations` (optional), `numberOfFolds` (optional), and `shouldShuffle` (optional)!"
    )

    assert(
      isArray(config.kValues) || isUndefined(config.kValues),
      "`kValues` must be a list of k-values to test or undefined!"
    )

    assert(
      shape(config.kValues).length === 1,
      "`kValues` must be a 1-dimensional list of k-values to test!"
    )

    config.kValues.forEach(k => {
      assert(
        typeof(k) === "number",
        "`kValues` must be a 1-dimensional list of k-values (numbers) to test!"
      )
    })

    assert(
      isWholeNumber(config.maxIterations) || isUndefined(config.maxIterations),
      "`maxIterations` must be a whole number or undefined!"
    )

    assert(
      isWholeNumber(config.maxRestarts) || isUndefined(config.maxRestarts),
      "`maxRestarts` must be a whole number or undefined!"
    )

    assert(
      isWholeNumber(config.numberOfFolds) || isUndefined(config.numberOfFolds),
      "`numberOfFolds` must be a whole number or undefined!"
    )

    assert(
      isBoolean(config.shouldShuffle) || isUndefined(config.shouldShuffle),
      "`shouldShuffle` must be a boolean or undefined!"
    )

    let self = this
    self.kValues = config.kValues || range(1, 16)
    self.maxIterations = config.maxIterations || 100
    self.maxRestarts = config.maxRestarts || 25
    self.numberOfFolds = config.numberOfFolds || 10
    self.shouldShuffle = !!config.shouldShuffle
    self.fittedModel = null
  }

  fit(x, callback){
    assert(x instanceof DataFrame, "`x` must be a DataFrame!")
    assert(isUndefined(callback) || typeof(callback) === "function", "`callback` must be undefined or a function!")

    let self = this

    if (self.shouldShuffle){
      x = x.shuffle()
    }

    let xShape = x.shape
    let isDone = false
    let previousK = -1
    let previousMeanScore = 1e20
    let bestK = -1

    self.kValues.forEach((k, kIndex) => {
      if (isDone) return
      let meanScore = 0

      for (let i=0; i<self.numberOfFolds; i++){
        if (callback){
          let progress = kIndex / self.kValues.length + (i / self.numberOfFolds) * (1 / self.kValues.length)
          callback(progress)
        }

        let idx = range(
          xShape[0] * i / self.numberOfFolds,
          xShape[0] * (i + 1) / self.numberOfFolds
        )

        let xTrain = x.drop(idx, null)
        let xTest = x.get(idx, null)
        let model = new KMeans({k, ...self})
        model.fit(xTrain)
        meanScore += model.score(xTest)
      }

      if (meanScore > previousMeanScore){
        isDone = true
        bestK = previousK
      }

      previousMeanScore = meanScore
      previousK = k
    })

    self.fittedModel = new KMeans({
      k: bestK,
      maxIterations: 100,
      maxRestarts: 25,
      shouldShuffle: true,
    })

    self.fittedModel.fit(x)
    return self
  }

  get centroids(){
    let self = this
    return self.fittedModel.centroids
  }

  score(x, labels){
    let self = this
    return self.fittedModel.score(x, labels)
  }

  predict(x){
    let self = this
    return self.fittedModel.predict(x)
  }
}

module.exports = KMeansCV
