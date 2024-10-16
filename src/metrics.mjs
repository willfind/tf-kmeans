// NOTE: I'm not sure whether this is a good idea or not, but I've added a bit
// to each scoring function such that they try to recompute scores again after
// converting all values to Numbers if the first result is NaN. The idea is
// that no additional time will be spent if all of the inputs are numbers; but
// if the inputs contain (e.g.) BigInts, then a result can still potentially be
// returned, albeit at a higher cost in time.

import {
  apply,
  assert,
  flatten,
  isDataFrame,
  isEqual,
  isSeries,
  isUndefined,
  shape,
} from "@jrc03c/js-math-tools"

import { isTFTensor, sign } from "./helpers.mjs"
import { scalar, tensor, tidy } from "@tensorflow/tfjs"

function numberify(x) {
  return apply(x, v => Number(v))
}

function sse(yTrue, yPred, shouldNumberify) {
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
    "`yPred` and `yTrue` must have the same shape!",
  )

  if (shouldNumberify) {
    yTrue = numberify(yTrue)
    yPred = numberify(yPred)
  }

  const out = tidy(() => {
    return tensor(yTrue).sub(tensor(yPred)).pow(2).sum().arraySync()
  })

  if (isNaN(out) && !shouldNumberify) {
    return sse(yTrue, yPred, true)
  } else {
    return out
  }
}

function accuracy(yTrue, yPred, shouldNumberify) {
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
    "`yPred` and `yTrue` must have the same shape!",
  )

  if (shouldNumberify) {
    yTrue = numberify(yTrue)
    yPred = numberify(yPred)
  }

  const yTrueFlat = flatten(yTrue)
  const yPredFlat = flatten(yPred)
  let correct = 0

  yTrueFlat.forEach((v, i) => {
    if (v === yPredFlat[i]) correct++
  })

  const out = correct / yTrueFlat.length

  if (isNaN(out) && !shouldNumberify) {
    return accuracy(yTrueFlat, yPredFlat, true)
  } else {
    return out
  }
}

function rSquared(yTrue, yPred, baseline, shouldNumberify) {
  return tidy(() => {
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

    if (isUndefined(baseline)) {
      baseline = yTrue
    }

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
      "`yTrue` and `yPred` must have the same shape!",
    )

    if (shouldNumberify) {
      yTrue = numberify(yTrue)
      yPred = numberify(yPred)
      baseline = numberify(baseline)
    }

    const yTrueOrig = yTrue
    const yPredOrig = yPred
    const baselineOrig = baseline

    yTrue = tensor(yTrue)
    yPred = tensor(yPred)
    baseline = tensor(baseline)

    const a = yTrue.sub(yPred).pow(2).sum()
    const b = yTrue.sub(baseline.mean()).pow(2).sum()
    const out = scalar(1).sub(a.div(b)).arraySync()

    if (isNaN(out) && !shouldNumberify) {
      return rSquared(yTrueOrig, yPredOrig, baselineOrig, true)
    } else {
      return out
    }
  })
}

function rScore(yTrue, yPred, baseline) {
  return tidy(() => {
    const r2 = scalar(rSquared(yTrue, yPred, baseline))
    return sign(r2).mul(r2.abs().sqrt()).arraySync()
  })
}

export { sse, accuracy, rSquared, rScore }
