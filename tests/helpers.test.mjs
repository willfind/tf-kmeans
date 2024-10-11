import { DataFrame, normal, Series } from "@jrc03c/js-math-tools"
import { engine, memory, tensor, Tensor } from "@tensorflow/tfjs"
import { isMatrix, isTFTensor, isWholeNumber } from "../src/helpers.mjs"

test("tests `isMatrix` function", () => {
  const rights = [
    [
      [2, 3, 4],
      [5, 6, 7],
    ],
    [
      [-2n, 3n, -4n],
      [5n, -6n, 7n],
    ],
    new DataFrame({ foo: [1, 2, 4, 8, 16], bar: [1, 3, 9, 27, 81] }),
    tensor(normal([23, 45])),
  ]

  rights.forEach(right => {
    expect(isMatrix(right)).toBe(true)

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
    [2, 3, 4],
    x => x,
    function (x) {
      return x
    },
    { hello: "world" },
    new Series({ hello: [10, 20, 30, 40, 50] }),
    tensor(normal(100)),
    tensor(normal([10, 20, 30])),
  ]

  wrongs.forEach(wrong => {
    expect(isMatrix(wrong)).toBe(false)

    if (wrong instanceof Tensor) {
      wrong.dispose()
    }
  })

  expect(memory().numTensors).toBe(0)
  expect(Object.keys(engine().state.registeredVariables).length).toBe(0)
})

test("tests `isTFTensor` function", () => {
  const selfReferencer = [2, 3, 4]
  selfReferencer.push(selfReferencer)

  const rights = [
    tensor(normal(100)),
    tensor(normal([10, 10])),
    tensor(normal([5, 5, 4])),
    tensor([
      [-2n, 3n, -4n],
      [5n, -6n, 7n],
    ]),
  ]

  rights.forEach(right => {
    expect(isTFTensor(right)).toBe(true)
    right.dispose()
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
    [2, 3, 4],
    [
      [2, 3, 4],
      [5, 6, 7],
    ],
    x => x,
    function (x) {
      return x
    },
    { hello: "world" },
    selfReferencer,
    new Series({ hello: [10, 20, 30, 40, 50] }),
    new DataFrame({ foo: [1, 2, 4, 8, 16], bar: [1, 3, 9, 27, 81] }),
  ]

  wrongs.forEach(wrong => {
    expect(isTFTensor(wrong)).toBe(false)
  })

  expect(memory().numTensors).toBe(0)
  expect(Object.keys(engine().state.registeredVariables).length).toBe(0)
})

test("tests `isWholeNumber` function", () => {
  const selfReferencer = [2, 3, 4]
  selfReferencer.push(selfReferencer)

  const rights = [0, 1, 234, 234n]

  rights.forEach(right => {
    expect(isWholeNumber(right)).toBe(true)
  })

  const wrongs = [
    2.3,
    -2.3,
    -234,
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
    [2, 3, 4],
    [
      [2, 3, 4],
      [5, 6, 7],
    ],
    x => x,
    function (x) {
      return x
    },
    { hello: "world" },
    selfReferencer,
    new Series({ hello: [10, 20, 30, 40, 50] }),
    new DataFrame({ foo: [1, 2, 4, 8, 16], bar: [1, 3, 9, 27, 81] }),
    tensor(normal([10, 10])),
  ]

  wrongs.forEach(wrong => {
    expect(isWholeNumber(wrong)).toBe(false)

    if (wrong instanceof Tensor) {
      wrong.dispose()
    }
  })

  expect(memory().numTensors).toBe(0)
  expect(Object.keys(engine().state.registeredVariables).length).toBe(0)
})
