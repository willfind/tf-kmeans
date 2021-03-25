const KMeansPlusPlus = require("./k-means++.js")
const tf = require("@tensorflow/tfjs")
const { isWholeNumber, isMatrix } = require("./helpers.js")

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

    assert(
      isFunction(config.class) || isUndefined(config.class), "`class` should be a class, a function, or undefined!"
    )

    let self = this
    self.kValues = config.kValues || range(1, 16)
    self.maxIterations = config.maxIterations || 300
    self.maxRestarts = config.maxRestarts || 10
    self.numberOfFolds = config.numberOfFolds || 4
    self.shouldShuffle = !!config.shouldShuffle
    self.class = config.class || KMeansPlusPlus
    self.fittedModel = null
  }

  fit(x, callback){
    assert(isMatrix(x), "`x` must be a matrix!")
    assert(isUndefined(callback) || typeof(callback) === "function", "`callback` must be undefined or a function!")

    let self = this
    if (self.shouldShuffle) x = shuffle(x)
    let xShape = shape(x)
    let isDone = false
    let previousK = self.kValues[0]
    let previousMeanScore = Infinity
    let bestK = self.kValues[0]
    let allScores = []

    self.kValues.forEach((k, kIndex) => {
      if (isDone) return
      let meanScore = 0
      let scores = []

      for (let i=0; i<self.numberOfFolds; i++){
        if (callback){
          let progress = kIndex / self.kValues.length + (i / self.numberOfFolds) * (1 / self.kValues.length)
          callback(progress)
        }

        let idx = range(
          parseInt(x.length * i / self.numberOfFolds),
          parseInt(x.length * (i + 1) / self.numberOfFolds)
        )

        let xTrain = x.filter((row, i) => idx.indexOf(i) < 0)
        let xTest = x.filter((row, i) => idx.indexOf(i) > -1)
        let model = new self.class({k, ...self})
        tf.tidy(() => model.fit(xTrain))

        try {
          let score = model.score(xTest)
          meanScore += score
          scores.push(score)
        } catch(e) {
          meanScore += 1e20
          scores.push(1e20)
        }
      }

      if (meanScore >= 0.9 * previousMeanScore){
        isDone = true
        bestK = previousK
      }

      previousMeanScore = meanScore
      previousK = k
      allScores.push(scores)
    })

    self.fittedModel = new self.class({
      k: bestK,
      maxIterations: 300,
      maxRestarts: 50,
    })

    self.fittedModel.fit(x)
    return allScores
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
