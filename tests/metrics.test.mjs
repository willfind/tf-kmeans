import { accuracy, rScore, rSquared, sse } from "../src/metrics.mjs"

import {
  abs,
  DataFrame,
  flatten,
  int,
  mean,
  normal,
  pow,
  random,
  range,
  round,
  Series,
  sign,
  sqrt,
  subtract,
  sum,
  time,
  zeros,
} from "@jrc03c/js-math-tools"

import { engine, memory, tensor, Tensor } from "@tensorflow/tfjs"

function slowAccuracy(xTrue, xPred) {
  const xTrueFlat = flatten(xTrue)
  const xPredFlat = flatten(xPred)
  return 1 - sum(abs(subtract(xTrueFlat, xPredFlat))) / xTrueFlat.length
}

function slowRScore(xTrue, xPred, baseline) {
  const r2 = slowRSquared(xTrue, xPred, baseline)
  if (isNaN(r2)) return NaN
  return sign(r2) * sqrt(abs(r2))
}

function slowRSquared(xTrue, xPred, baseline) {
  if (!baseline) baseline = xTrue
  const num = slowSse(xTrue, xPred)
  const den = slowSse(xTrue, mean(baseline))
  if (den === 0) return NaN
  return 1 - num / den
}

function slowSse(xTrue, xPred) {
  return sum(pow(subtract(xTrue, xPred), 2))
}

test("tests that the `accuracy` function computes scores correctly", () => {
  range(0, 100).forEach(i => {
    const a = zeros(100)
    const b = zeros(100)

    range(0, i).forEach(j => {
      b[j] = 1
    })

    expect(accuracy(a, b)).toBeCloseTo(1 - i / 100)
  })

  range(0, 10).forEach(() => {
    const tempShape = range(0, int(random() * 3) + 1).map(
      () => int(random() * 5) + 3,
    )

    const c = round(random(tempShape))
    const d = round(random(tempShape))

    expect(accuracy(c, d)).toBeCloseTo(slowAccuracy(c, d))
  })

  const eInts = round(random(100))
  const fInts = round(random(100))
  const eBigInts = eInts.map(v => BigInt(v))
  const fBigInts = fInts.map(v => BigInt(v))
  expect(accuracy(eInts, fInts)).toBeCloseTo(accuracy(eBigInts, fBigInts))

  expect(memory().numTensors).toBe(0)
  expect(Object.keys(engine().state.registeredVariables).length).toBe(0)
})

test("tests that the `rScore` function computes scores correctly", () => {
  const a = normal([100, 100])
  expect(rScore(a, a)).toBeCloseTo(1)

  range(0, 25).forEach(() => {
    const tempShape = range(0, int(random() * 3) + 1).map(
      () => int(random() * 5) + 3,
    )

    const b = normal(tempShape)
    const c = normal(tempShape)
    const d = random() < 0.5 ? normal(tempShape) : null
    expect(rScore(b, c, d)).toBeCloseTo(slowRScore(b, c, d))
  })

  const eInts = normal([100, 5]).map(row => row.map(v => Math.round(v)))
  const fInts = normal([100, 5]).map(row => row.map(v => Math.round(v)))
  const eBigInts = eInts.map(row => row.map(v => BigInt(v)))
  const fBigInts = fInts.map(row => row.map(v => BigInt(v)))
  expect(rScore(eInts, fInts)).toBeCloseTo(rScore(eBigInts, fBigInts))

  expect(memory().numTensors).toBe(0)
  expect(Object.keys(engine().state.registeredVariables).length).toBe(0)
})

test("tests that the `rSquared` function computes scores correctly", () => {
  const a = normal([100, 100])
  expect(rSquared(a, a)).toBeCloseTo(1)

  range(0, 25).forEach(() => {
    const tempShape = range(0, int(random() * 3) + 1).map(
      () => int(random() * 5) + 3,
    )

    const b = normal(tempShape)
    const c = normal(tempShape)
    const d = random() < 0.5 ? normal(tempShape) : null
    expect(rSquared(b, c, d)).toBeCloseTo(slowRSquared(b, c, d))
  })

  const eInts = normal([100, 5]).map(row => row.map(v => Math.round(v)))
  const fInts = normal([100, 5]).map(row => row.map(v => Math.round(v)))
  const eBigInts = eInts.map(row => row.map(v => BigInt(v)))
  const fBigInts = fInts.map(row => row.map(v => BigInt(v)))
  expect(rSquared(eInts, fInts)).toBeCloseTo(rSquared(eBigInts, fBigInts))

  expect(memory().numTensors).toBe(0)
  expect(Object.keys(engine().state.registeredVariables).length).toBe(0)
})

test("tests that the `sse` function computes scores correctly", () => {
  const a = normal([100, 100])
  expect(sse(a, a)).toBeCloseTo(0)

  range(0, 10).forEach(() => {
    const tempShape = range(0, int(random() * 3) + 1).map(
      () => int(random() * 5) + 3,
    )

    const b = normal(tempShape)
    const c = normal(tempShape)
    expect(sse(b, c)).toBeCloseTo(slowSse(b, c))
  })

  const eInts = normal([100, 5]).map(row => row.map(v => Math.round(v)))
  const fInts = normal([100, 5]).map(row => row.map(v => Math.round(v)))
  const eBigInts = eInts.map(row => row.map(v => BigInt(v)))
  const fBigInts = fInts.map(row => row.map(v => BigInt(v)))
  expect(abs(sse(eInts, fInts) - sse(eBigInts, fBigInts))).toBeLessThan(0.01)

  expect(memory().numTensors).toBe(0)
  expect(Object.keys(engine().state.registeredVariables).length).toBe(0)
})

test("tests that the `accuracy` function throws errors when given invalid data types", () => {
  const rights = [
    [2, 3, 4],
    [
      [2, 3, 4],
      [5, 6, 7],
    ],
    new Series({ hello: [10, 20, 30, 40, 50] }),
    new DataFrame({ foo: [1, 2, 4, 8, 16], bar: [1, 3, 9, 27, 81] }),
    tensor(round(random(100))),
  ]

  rights.forEach(right => {
    expect(() => accuracy(right, right)).not.toThrow()

    if (right instanceof Tensor) {
      right.dispose()
    }
  })

  const wrongs = [
    0,
    1,
    2.3,
    -2.3,
    234n,
    -234n,
    Infinity,
    -Infinity,
    NaN,
    "foo",
    true,
    false,
    null,
    undefined,
    Symbol.for("Hello, world!"),
    x => x,
    function (x) {
      return x
    },
    { hello: "world" },
  ]

  wrongs.forEach(wrong => {
    expect(() => accuracy(wrong, wrong)).toThrow()
  })

  expect(memory().numTensors).toBe(0)
  expect(Object.keys(engine().state.registeredVariables).length).toBe(0)
})

test("tests that the `rScore` function throws errors when given invalid data types", () => {
  const rights = [
    [2, 3, 4],
    [
      [2, 3, 4],
      [5, 6, 7],
    ],
    new Series({ hello: [10, 20, 30, 40, 50] }),
    new DataFrame({ foo: [1, 2, 4, 8, 16], bar: [1, 3, 9, 27, 81] }),
    tensor(round(random(100))),
  ]

  rights.forEach(right => {
    expect(() => rScore(right, right, right)).not.toThrow()

    if (right instanceof Tensor) {
      right.dispose()
    }
  })

  const wrongs = [
    0,
    1,
    2.3,
    -2.3,
    234n,
    -234n,
    Infinity,
    -Infinity,
    NaN,
    "foo",
    true,
    false,
    null,
    undefined,
    Symbol.for("Hello, world!"),
    x => x,
    function (x) {
      return x
    },
    { hello: "world" },
  ]

  wrongs.forEach(wrong => {
    expect(() => rScore(wrong, wrong, wrong)).toThrow()
  })

  expect(memory().numTensors).toBe(0)
  expect(Object.keys(engine().state.registeredVariables).length).toBe(0)
})

test("tests that the `rSquared` function throws errors when given invalid data types", () => {
  const rights = [
    [2, 3, 4],
    [
      [2, 3, 4],
      [5, 6, 7],
    ],
    new Series({ hello: [10, 20, 30, 40, 50] }),
    new DataFrame({ foo: [1, 2, 4, 8, 16], bar: [1, 3, 9, 27, 81] }),
    tensor(round(random(100))),
  ]

  rights.forEach(right => {
    expect(() => rSquared(right, right, right)).not.toThrow()

    if (right instanceof Tensor) {
      right.dispose()
    }
  })

  const wrongs = [
    0,
    1,
    2.3,
    -2.3,
    234n,
    -234n,
    Infinity,
    -Infinity,
    NaN,
    "foo",
    true,
    false,
    null,
    undefined,
    Symbol.for("Hello, world!"),
    x => x,
    function (x) {
      return x
    },
    { hello: "world" },
  ]

  wrongs.forEach(wrong => {
    expect(() => rSquared(wrong, wrong, wrong)).toThrow()
  })

  expect(memory().numTensors).toBe(0)
  expect(Object.keys(engine().state.registeredVariables).length).toBe(0)
})

test("tests that the `sse` function throws errors when given invalid data types", () => {
  const rights = [
    [2, 3, 4],
    [
      [2, 3, 4],
      [5, 6, 7],
    ],
    new Series({ hello: [10, 20, 30, 40, 50] }),
    new DataFrame({ foo: [1, 2, 4, 8, 16], bar: [1, 3, 9, 27, 81] }),
    tensor(round(random(100))),
  ]

  rights.forEach(right => {
    expect(() => sse(right, right)).not.toThrow()

    if (right instanceof Tensor) {
      right.dispose()
    }
  })

  const wrongs = [
    0,
    1,
    2.3,
    -2.3,
    234n,
    -234n,
    Infinity,
    -Infinity,
    NaN,
    "foo",
    true,
    false,
    null,
    undefined,
    Symbol.for("Hello, world!"),
    x => x,
    function (x) {
      return x
    },
    { hello: "world" },
  ]

  wrongs.forEach(wrong => {
    expect(() => sse(wrong, wrong)).toThrow()
  })

  expect(memory().numTensors).toBe(0)
  expect(Object.keys(engine().state.registeredVariables).length).toBe(0)
})

test("tests that the `accuracy` function is faster than the `slowAccuracy` function", () => {
  const ytrue = round(random(10000))
  const ypred = round(random(10000))
  const t1 = time(() => accuracy(ytrue, ypred))
  const t2 = time(() => slowAccuracy(ytrue, ypred))
  expect(t1).toBeLessThanOrEqualTo(t2)
})

test("tests that the `rScore` function is faster than the `slowRScore` function", () => {
  const ytrue = normal([1000, 10])
  const ypred = normal([1000, 10])
  const t1 = time(() => rScore(ytrue, ypred))
  const t2 = time(() => slowRScore(ytrue, ypred))
  expect(t1).toBeLessThanOrEqualTo(t2)
})

test("tests that the `rSquared` function is faster than the `slowRSquared` function", () => {
  const ytrue = normal([1000, 10])
  const ypred = normal([1000, 10])
  const t1 = time(() => rSquared(ytrue, ypred))
  const t2 = time(() => slowRSquared(ytrue, ypred))
  expect(t1).toBeLessThanOrEqualTo(t2)
})

test("tests that the `sse` function is faster than the `slowSse` function", () => {
  const ytrue = normal([1000, 10])
  const ypred = normal([1000, 10])
  const t1 = time(() => sse(ytrue, ypred))
  const t2 = time(() => slowSse(ytrue, ypred))
  expect(t1).toBeLessThanOrEqualTo(t2)
})
