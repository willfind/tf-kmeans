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
const { TFKMeansPlusPlus } = require("../../..").models
const { trainTestSplit } = require("@jrc03c/js-data-science-helpers")

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

function createGenericTest(Model, progress) {
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
    const shouldReturnCallableGenerator = true
    const gen = model.fit(xTrain, progress, shouldReturnCallableGenerator)
    let status = { done: false }

    while (!status.done) {
      status = gen.next()
      await pause(10)
    }

    model.centroids = orderCentroids(centroidsTrue, model.centroids)

    const labelsTrainPred = model.predict(xTrain)
    const labelsTestPred = model.predict(xTest)

    expect(accuracy(labelsTrain, labelsTrainPred)).toBeGreaterThan(0.95)
    expect(accuracy(labelsTest, labelsTestPred)).toBeGreaterThan(0.95)

    model.dispose()
  })
}

const drone = new Bee.Drone()
let progress
let startTime

drone.on("start-tests", (request, response) => {
  console.log("drone is starting tests...")
  console.log("note: watch for memory leaks in this test!")
  response.send(true)
  startTime = new Date()
  createGenericTest(TFKMeansPlusPlus, p => (progress = p))
})

drone.on("get-progress", (request, response) => {
  console.log("drone is getting progress...")
  return response.send(progress)
})

drone.on("get-results", (request, response) => {
  console.log("drone is getting results...")
  return response.send(new Date() - startTime)
})
