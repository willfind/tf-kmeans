const {
  add,
  int,
  normal,
  random,
  range,
  scale,
  shape,
} = require("@jrc03c/js-math-tools")

const { accuracy } = require("../../..").metrics
const { orderCentroids } = require("../../../src/helpers")
const { TFKMeansMeta } = require("../../..").models
const { rScore, trainTestSplit } = require("@jrc03c/js-data-science-helpers")

const Bee = require("@jrc03c/bee")
const pause = require("@jrc03c/pause")

const test = (desc, fn) => fn()

function expect(value) {
  return {
    toBe(x) {
      if (x !== value) {
        throw new Error(`We expected ${value} but received ${x}!`)
      }
    },

    toBeGreaterThan(x) {
      if (value <= x) {
        throw new Error(
          `Expected ${value} to be greater than ${x}, but it's not!`
        )
      }
    },

    toBeLessThan(x) {
      if (value >= x) {
        throw new Error(`Expected ${value} to be less than ${x}, but it's not!`)
      }
    },
  }
}

function createGenericTest(progFn) {
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

    while (!model._fitState || !model._fitState.isFinished) {
      model.fitStep(xTrain, progFn)
      await pause(0)
    }

    model.centroids = orderCentroids(centroidsTrue, model.centroids)

    const labelsTrainPred = model.predict(xTrain)
    const labelsTestPred = model.predict(xTest)

    expect(model.k).toBe(5)
    expect(rScore(centroidsTrue, model.centroids)).toBeGreaterThan(0.95)
    expect(accuracy(labelsTrain, labelsTrainPred)).toBeGreaterThan(0.95)
    expect(accuracy(labelsTest, labelsTestPred)).toBeGreaterThan(0.95)
  })
}

const drone = new Bee.Drone()
let progress
let startTime

drone.on("start-tests", (request, response) => {
  console.log("drone is starting tests...")
  response.send(true)
  startTime = new Date()
  progress = 0

  createGenericTest(p => (progress = p))
})

drone.on("get-progress", (request, response) => {
  console.log("drone is getting progress...")
  return response.send(progress)
})

drone.on("get-results", (request, response) => {
  console.log("drone is getting results...")
  return response.send(new Date() - startTime)
})
