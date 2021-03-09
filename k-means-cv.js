const KMeans = require("./k-means.js")

class KMeansCV {
  constructor(kValues, maxIterations, numberOfFolds){
    let self = this
    assert(isArray(kValues), "The first argument to the `KMeansCV` constructor must be a list of K-values to test!")
    self.kValues = kValues || [1]
    self.maxIterations = maxIterations || 100
    self.numberOfFolds = numberOfFolds || 10
  }

  fit(x){
    assert(x instanceof DataFrame, "`x` must be a DataFrame!")

    let self = this
    let xShape = x.shape
    let scores = []

    for (let i=0; i<self.numberOfFolds; i++){
      let idx = range(
        xShape[0] * i / self.numberOfFolds,
        xShape[0] * (i + 1) / self.numberOfFolds,
      )

      let xTrain = x.drop(idx, null)
      let xTest = x.get(idx, null)
      let foldScores = []

      self.kValues.forEach(k => {
        let model = new KMeans(k)
        model.fit(xTrain)
        foldScores.push(model.score(xTest))
      })

      scores.push(foldScores)
    }

    scores = new DataFrame(scores)
    scores.columns = self.kValues.map(k => k.toString())
    scores.index = range(0, self.numberOfFolds).map(i => "fold" + i.toString())

    return scores
  }

  score(x, labels){
    assert(x instanceof DataFrame, "`x` must be a DataFrame!")

    let self = this
    return 0
  }

  predict(x){
    assert(x instanceof DataFrame, "`x` must be a DataFrame!")

    let self = this
    let labels = []
    return labels
  }
}

module.exports = KMeansCV
