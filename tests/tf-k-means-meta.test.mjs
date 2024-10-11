import {
  add,
  int,
  normal,
  random,
  range,
  scale,
  shape,
} from "@jrc03c/js-math-tools"

import { engine, memory } from "@tensorflow/tfjs"
import { helpers, metrics, models } from "../src/index.mjs"
import { rScore, trainTestSplit } from "@jrc03c/js-data-science-helpers"

const { accuracy } = metrics
const { orderCentroids } = helpers
const { TFKMeansMeta } = models

test("tests that the`TFKMeansMeta` model works correctly", async () => {
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
  await model.fit(xTrain)
  model.centroids = orderCentroids(centroidsTrue, model.centroids)

  const labelsTrainPred = model.predict(xTrain)
  const labelsTestPred = model.predict(xTest)

  expect(model.k).toBe(5)
  expect(rScore(centroidsTrue, model.centroids)).toBeGreaterThan(0.95)
  expect(accuracy(labelsTrain, labelsTrainPred)).toBeGreaterThan(0.95)
  expect(accuracy(labelsTest, labelsTestPred)).toBeGreaterThan(0.95)

  expect(memory().numTensors).toBe(0)
  expect(Object.keys(engine().state.registeredVariables).length).toBe(0)
})

test("tests that the`TFKMeansMeta` model can handle BigIints", async () => {
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

  const model = new TFKMeansMeta({ ks: [centroids.length] })
  await model.fit(x)
  expect(model.score(x)).not.toBeNaN()
})
