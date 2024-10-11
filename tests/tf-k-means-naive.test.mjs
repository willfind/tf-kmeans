import {
  add,
  int,
  normal,
  random,
  range,
  scale,
  shape,
} from "@jrc03c/js-math-tools"

import { engine, memory, models } from "@tensorflow/tfjs"
import { helpers, metrics } from "../dist/tf-k-means.import.min.mjs"
import { trainTestSplit } from "@jrc03c/js-data-science-helpers"

const { accuracy } = metrics
const { orderCentroids } = helpers
const { TFKMeansNaive } = models

test("tests that the `TFKMeansNaive` model works correctly", async () => {
  const centroidsTrue = normal([5, 10]).map(row =>
    row.map(v => v * 100 + normal() * 100),
  )

  const labels = []

  const x = range(0, 500).map(() => {
    const index = int(random() * centroidsTrue.length)
    const c = centroidsTrue[index]
    labels.push(index)
    return add(c, scale(5, normal(shape(c))))
  })

  const [xTrain, xTest, labelsTrain, labelsTest] = trainTestSplit(x, labels)
  const model = new TFKMeansNaive({ k: centroidsTrue.length })
  await model.fit(xTrain)
  model.centroids = orderCentroids(centroidsTrue, model.centroids)

  const labelsTrainPred = model.predict(xTrain)
  const labelsTestPred = model.predict(xTest)

  expect(accuracy(labelsTrain, labelsTrainPred)).toBeGreaterThan(0.95)
  expect(accuracy(labelsTest, labelsTestPred)).toBeGreaterThan(0.95)

  const model2 = new TFKMeansNaive({ k: centroidsTrue.length })
  const fitStep = model2.getFitStepFunction(xTrain)
  let state

  while (!state || !state.isFinished) {
    state = await fitStep()
  }

  expect(memory().numTensors).toBe(0)
  expect(Object.keys(engine().state.registeredVariables).length).toBe(0)
})

test("tests that the `TFKMeansNaive` model can handle BigInts", async () => {
  const centroids = normal([5, 3]).map(row =>
    row.map(v => BigInt(Math.round(v))),
  )

  const labels = []

  const x = range(0, 20).map(() => {
    const i = Math.floor(Math.random() * centroids.length)
    labels.push(i)
    const c = centroids[i]
    return c.map(v => BigInt(Math.round(Number(v) + 0.1 * normal())))
  })

  const model = new TFKMeansNaive({ k: centroids.length })
  await model.fit(x)
  expect(model.score(x)).not.toBeNaN()
})
