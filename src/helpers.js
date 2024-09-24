const {
  argmin,
  distance,
  isArray,
  isDataFrame,
  isNumber,
  isSeries,
  shape,
} = require("@jrc03c/js-math-tools")

const tf = require("@tensorflow/tfjs")

const isBrowser = new Function(
  "try { return this === window } catch(e) { return false }"
)

function isMatrix(x) {
  if (isTFTensor(x)) {
    return x.shape.length === 2
  }

  if (isDataFrame(x)) {
    return true
  }

  return isArray(x) && shape(x).length === 2
}

function isTFTensor(x) {
  return x instanceof tf.Tensor
}

function isWholeNumber(x) {
  return (
    isNumber(x) && Math.floor(Number(x)) === Number(x) && x >= 0 && x < Infinity
  )
}

function orderCentroids(cTrue, cPred) {
  return tf.tidy(() => {
    if (isTFTensor(cTrue)) {
      cTrue = cTrue.arraySync()
    }

    if (isTFTensor(cPred)) {
      cPred = cPred.arraySync()
    }

    const out = []
    const temp = cPred.slice()

    cTrue.forEach(c1 => {
      const closestCentroidIndex = argmin(temp.map(c2 => distance(c1, c2)))
      out.push(temp[closestCentroidIndex])
      temp.splice(closestCentroidIndex, 1)
    })

    return out.concat(temp)
  })
}

function sign(x) {
  return tf.tidy(() => {
    if (isDataFrame(x) || isSeries(x)) {
      x = x.values
    }

    if (!isTFTensor(x)) x = tf.tensor(x)
    return x.div(x.abs())
  })
}

module.exports = {
  isBrowser,
  isMatrix,
  isTFTensor,
  isWholeNumber,
  orderCentroids,
  sign,
}
