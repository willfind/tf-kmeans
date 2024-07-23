const {
  add,
  int,
  normal,
  random,
  range,
  scale,
  shape,
} = require("@jrc03c/js-math-tools")

const { accuracy } = require("..").metrics
const { orderCentroids } = require("../src/helpers")
const { trainTestSplit } = require("@jrc03c/js-data-science-helpers")
const tf = require("@tensorflow/tfjs")

module.exports = function createGenericTest(Model) {
  test(`tests that the \`${Model.name}\` model works correctly`, async () => {
    const centroidsTrue = normal([5, 10]).map(row =>
      row.map(v => v * 100 + normal() * 100)
    )

    const labels = []

    const x = range(0, 500).map(() => {
      const index = int(random() * centroidsTrue.length)
      const c = centroidsTrue[index]
      labels.push(index)
      return add(c, scale(5, normal(shape(c))))
    })

    const [xTrain, xTest, labelsTrain, labelsTest] = trainTestSplit(x, labels)
    const model = new Model({ k: centroidsTrue.length })
    await model.fit(xTrain)
    model.centroids = orderCentroids(centroidsTrue, model.centroids)

    const labelsTrainPred = model.predict(xTrain)
    const labelsTestPred = model.predict(xTest)

    expect(accuracy(labelsTrain, labelsTrainPred)).toBeGreaterThan(0.95)
    expect(accuracy(labelsTest, labelsTestPred)).toBeGreaterThan(0.95)

    const model2 = new Model({ k: centroidsTrue.length })
    const fitStep = model2.getFitStepFunction(xTrain)
    let state

    while (!state || !state.isFinished) {
      state = await fitStep()
    }

    expect(tf.memory().numTensors).toBe(0)
    expect(Object.keys(tf.engine().state.registeredVariables).length).toBe(0)
  })
}
