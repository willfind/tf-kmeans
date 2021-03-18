const tf = require("@tensorflow/tfjs")

function isTFTensor(x){
  return x instanceof tf.Tensor
}

module.exports = isTFTensor
