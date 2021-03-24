require("./all.js")

function innerDistances1(x){
  let out = []

  x.forEach(p1 => {
    let distances = []

    x.forEach(p2 => {
      distances.push(pow(distance(p1, p2), 2))
    })

    out.push(distances)
  })

  return out
}

function innerDistances2(x){
  return tf.tidy(() => {
    let xtf = tf.tensor(x)
    let xtf1 = xtf.expandDims(0)
    let xtf2 = xtf.expandDims(1)
    return xtf1.sub(xtf2).pow(2).sum(2).arraySync()
  })
}

let x = normal([5, 5])
print(innerDistances1(x))
print(innerDistances2(x))
