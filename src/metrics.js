const {
  assert,
  flatten,
  isDataFrame,
  isEqual,
  isSeries,
  isUndefined,
  shape,
} = require("@jrc03c/js-math-tools")

const { isTFTensor, sign } = require("./helpers")
const tf = require("@tensorflow/tfjs")

function sse(yTrue, yPred) {
  if (isTFTensor(yTrue)) {
    yTrue = yTrue.arraySync()
  }

  if (isDataFrame(yTrue) || isSeries(yTrue)) {
    yTrue = yTrue.values
  }

  if (isTFTensor(yPred)) {
    yPred = yPred.arraySync()
  }

  if (isDataFrame(yPred) || isSeries(yPred)) {
    yPred = yPred.values
  }

  assert(
    isEqual(shape(yTrue), shape(yPred)),
    "`yPred` and `yTrue` must have the same shape!"
  )

  return tf.tidy(() => {
    return tf.tensor(yTrue).sub(tf.tensor(yPred)).pow(2).sum().arraySync()
  })
}

function accuracy(yTrue, yPred) {
  if (isTFTensor(yTrue)) {
    yTrue = yTrue.arraySync()
  }

  if (isDataFrame(yTrue) || isSeries(yTrue)) {
    yTrue = yTrue.values
  }

  if (isTFTensor(yPred)) {
    yPred = yPred.arraySync()
  }

  if (isDataFrame(yPred) || isSeries(yPred)) {
    yPred = yPred.values
  }

  assert(
    isEqual(shape(yTrue), shape(yPred)),
    "`yPred` and `yTrue` must have the same shape!"
  )

  const yTrueFlat = flatten(yTrue)
  const yPredFlat = flatten(yPred)
  let correct = 0

  yTrueFlat.forEach((v, i) => {
    if (v === yPredFlat[i]) correct++
  })

  return correct / yTrueFlat.length
}

function rSquared(yTrue, yPred, baseline) {
  return tf.tidy(() => {
    if (isTFTensor(yTrue)) {
      yTrue = yTrue.arraySync()
    }

    if (isDataFrame(yTrue) || isSeries(yTrue)) {
      yTrue = yTrue.values
    }

    if (isTFTensor(yPred)) {
      yPred = yPred.arraySync()
    }

    if (isDataFrame(yPred) || isSeries(yPred)) {
      yPred = yPred.values
    }

    if (isUndefined(baseline)) baseline = yTrue

    if (isTFTensor(baseline)) {
      baseline = baseline.arraySync()
    }

    if (isDataFrame(baseline) || isSeries(baseline)) {
      baseline = baseline.values
    }

    if (typeof baseline === "number") {
      baseline = [baseline]
    }

    assert(
      isEqual(shape(yTrue), shape(yPred)),
      "`yTrue` and `yPred` must have the same shape!"
    )

    yTrue = tf.tensor(yTrue)
    yPred = tf.tensor(yPred)
    baseline = tf.tensor(baseline)

    const a = yTrue.sub(yPred).pow(2).sum()
    const b = yTrue.sub(baseline.mean()).pow(2).sum()
    return tf.scalar(1).sub(a.div(b)).arraySync()
  })
}

function rScore(yTrue, yPred, baseline) {
  return tf.tidy(() => {
    const r2 = tf.scalar(rSquared(yTrue, yPred, baseline))
    return sign(r2).mul(r2.abs().sqrt()).arraySync()
  })
}

module.exports = { sse, accuracy, rSquared, rScore }
