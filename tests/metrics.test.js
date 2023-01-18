const { accuracy, rScore, rSquared, sse } = require("../src/metrics")

const {
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
  zeros,
} = require("@jrc03c/js-math-tools")

const { tf } = require("../src/helpers")

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
      () => int(random() * 5) + 3
    )

    const c = round(random(tempShape))
    const d = round(random(tempShape))

    expect(accuracy(c, d)).toBeCloseTo(slowAccuracy(c, d))
  })
})

test("tests that the `rScore` function computes scores correctly", () => {
  const a = normal([100, 100])
  expect(rScore(a, a)).toBeCloseTo(1)

  range(0, 25).forEach(() => {
    const tempShape = range(0, int(random() * 3) + 1).map(
      () => int(random() * 5) + 3
    )

    const b = normal(tempShape)
    const c = normal(tempShape)
    const d = random() < 0.5 ? normal(tempShape) : null
    expect(rScore(b, c, d)).toBeCloseTo(slowRScore(b, c, d))
  })
})

test("tests that the `rSquared` function computes scores correctly", () => {
  const a = normal([100, 100])
  expect(rSquared(a, a)).toBeCloseTo(1)

  range(0, 25).forEach(() => {
    const tempShape = range(0, int(random() * 3) + 1).map(
      () => int(random() * 5) + 3
    )

    const b = normal(tempShape)
    const c = normal(tempShape)
    const d = random() < 0.5 ? normal(tempShape) : null
    expect(rSquared(b, c, d)).toBeCloseTo(slowRSquared(b, c, d))
  })
})

test("tests that the `sse` function computes scores correctly", () => {
  const a = normal([100, 100])
  expect(sse(a, a)).toBeCloseTo(0)

  range(0, 10).forEach(() => {
    const tempShape = range(0, int(random() * 3) + 1).map(
      () => int(random() * 5) + 3
    )

    const b = normal(tempShape)
    const c = normal(tempShape)
    expect(sse(b, c)).toBeCloseTo(slowSse(b, c))
  })
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
    tf.tensor(round(random(100))),
  ]

  rights.forEach(right => {
    expect(() => accuracy(right, right)).not.toThrow()
  })

  const wrongs = [
    0,
    1,
    2.3,
    -2.3,
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
    tf.tensor(round(random(100))),
  ]

  rights.forEach(right => {
    expect(() => rScore(right, right, right)).not.toThrow()
  })

  const wrongs = [
    0,
    1,
    2.3,
    -2.3,
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
    tf.tensor(round(random(100))),
  ]

  rights.forEach(right => {
    expect(() => rSquared(right, right, right)).not.toThrow()
  })

  const wrongs = [
    0,
    1,
    2.3,
    -2.3,
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
    tf.tensor(round(random(100))),
  ]

  rights.forEach(right => {
    expect(() => sse(right, right)).not.toThrow()
  })

  const wrongs = [
    0,
    1,
    2.3,
    -2.3,
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
})
