const {
  add,
  int,
  normal,
  random,
  range,
  scale,
  shape,
} = require("@jrc03c/js-math-tools")

const { accuracy } = require("../src").metrics
const { orderCentroids } = require("../src/helpers")
const { rScore, trainTestSplit } = require("@jrc03c/js-data-science-helpers")
const { TFKMeansMeta } = require("../src").models

test("tests that the`TFKMeansMeta` model works correctly", () => {
  const centroidsTrue = normal([5, 10])
  const labels = []

  const x = range(0, 500).map(() => {
    const index = int(random() * centroidsTrue.length)
    const c = centroidsTrue[index]
    labels.push(index)
    return add(c, scale(0.1, normal(shape(c))))
  })

  const [xTrain, xTest, labelsTrain, labelsTest] = trainTestSplit(x, labels)
  const model = new TFKMeansMeta()
  model.fit(xTrain)
  model.centroids = orderCentroids(centroidsTrue, model.centroids)

  const labelsTrainPred = model.predict(xTrain)
  const labelsTestPred = model.predict(xTest)

  expect(model.k).toBe(5)
  expect(rScore(centroidsTrue, model.centroids)).toBeGreaterThan(0.95)
  expect(accuracy(labelsTrain, labelsTrainPred)).toBeGreaterThan(0.95)
  expect(accuracy(labelsTest, labelsTestPred)).toBeGreaterThan(0.95)
})
