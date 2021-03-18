const tf = require("@tensorflow/tfjs")
const isTFTensor = require("./is-tf-tensor.js")

function missingAwareDistance(a, b){
  // returns a tf operation / result, not a value!
  // (so you have to call .array() to get values out of it!)
  // (also, this isn't currently missing-aware!)
  return tf.tidy(() => {
    assert(isTFTensor(a), "`a` must be a tf.Tensor!")
    assert(isTFTensor(b), "`b` must be a tf.Tensor!")
    
    return a.sub(b).pow(tf.scalar(2)).mean()
  })
}

module.exports = missingAwareDistance
