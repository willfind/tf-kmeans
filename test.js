require("./all.js")

let x = tf.tensor(range(0, 10))
let mask = tf.tensor(round(random(10)), "bool")
tf.booleanMaskAsync(x, mask).then(result => result.print())
