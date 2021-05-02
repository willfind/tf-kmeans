const tf = require("@tensorflow/tfjs")
const { add, scale, pow, isArray, shape, isNumber } require("js-math-tools")

const subtract = (a, b) => add(a, scale(b, -1))
const divide = (a, b) => scale(a, pow(b, -1))

function isMatrix(x){
  return isArray(x) && shape(x).length === 2
}

function isTFTensor(x){
  return x instanceof tf.Tensor
}

function isWholeNumber(x){
  return isNumber(x) && parseInt(x) === x && x >= 0
}

function missingAwareSquaredDistance(a, b){
  // this isn't currently missing-aware!!!
  return tf.tidy(() => {
    if (!isTFTensor(a)) a = tf.tensor(a)
    if (!isTFTensor(b)) b = tf.tensor(b)
    return a.sub(b).pow(2).sum()
  })
}

function outerSquaredDistances(a, b){
  return tf.tidy(() => {
    if (!isTFTensor(a)) a = tf.tensor(a)
    if (!isTFTensor(b)) b = tf.tensor(b)

    a = a.expandDims(1)
    b = b.expandDims(0)
    return a.sub(b).pow(2).sum(2)
  })
}

function sign(x){
  return tf.tidy(() => {
    if (!isTFTensor(x)) x = tf.tensor(x)
    return x.div(x.abs())
  })
}

function rScore(xtrue, xpred){
  return tf.tidy(() => {
    if (!isTFTensor(xtrue)) xtrue = tf.tensor(xtrue)
    if (!isTFTensor(xpred)) xpred = tf.tensor(xpred)
    let a = xtrue.sub(xpred).pow(2).sum()
    let b = xtrue.sub(xtrue.mean()).pow(2).sum()
    let r2 = tf.scalar(1).sub(a.div(b))
    return sign(r2).mul(r2.abs().sqrt())
  })
}

module.exports = {
  subtract,
  divide,
  isMatrix,
  isTFTensor,
  isWholeNumber,
  missingAwareSquaredDistance,
  outerSquaredDistances,
  sign,
  rScore,
}
