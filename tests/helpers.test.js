const { DataFrame, normal, Series } = require("@jrc03c/js-math-tools")
const { isMatrix, isTFTensor, isWholeNumber, tf } = require("../src/helpers")

test("tests `isMatrix` function", () => {
  tf.tidy(() => {
    const rights = [
      [
        [2, 3, 4],
        [5, 6, 7],
      ],
      new DataFrame({ foo: [1, 2, 4, 8, 16], bar: [1, 3, 9, 27, 81] }),
      tf.tensor(normal([23, 45])),
    ]

    rights.forEach(right => {
      expect(isMatrix(right)).toBe(true)
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
      [2, 3, 4],
      x => x,
      function (x) {
        return x
      },
      { hello: "world" },
      new Series({ hello: [10, 20, 30, 40, 50] }),
      tf.tensor(normal(100)),
      tf.tensor(normal([10, 20, 30])),
    ]

    wrongs.forEach(wrong => {
      expect(isMatrix(wrong)).toBe(false)
    })
  })
})

test("tests `isTFTensor` function", () => {
  tf.tidy(() => {
    const selfReferencer = [2, 3, 4]
    selfReferencer.push(selfReferencer)

    const rights = [
      tf.tensor(normal(100)),
      tf.tensor(normal([10, 10])),
      tf.tensor(normal([5, 5, 4])),
    ]

    rights.forEach(right => {
      expect(isTFTensor(right)).toBe(true)
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
  })
})

test("tests `isWholeNumber` function", () => {
  tf.tidy(() => {
    const selfReferencer = [2, 3, 4]
    selfReferencer.push(selfReferencer)

    const rights = [0, 1, 234]

    rights.forEach(right => {
      expect(isWholeNumber(right)).toBe(true)
    })

    const wrongs = [
      2.3,
      -2.3,
      -234,
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
      tf.tensor(normal([10, 10])),
    ]

    wrongs.forEach(wrong => {
      expect(isWholeNumber(wrong)).toBe(false)
    })
  })
})
