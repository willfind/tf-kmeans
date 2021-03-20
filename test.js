const tf = require("@tensorflow/tfjs")
require("js-math-tools").dump()

let x = tf.tensor([
  [0, 1],
  [2, 3],
  [4, 5]
])

let labels = tf.tensor([0, 0, 2, 2])

labels.data().then(labels => {
  x.gather(labels).array().then(console.log)
})
