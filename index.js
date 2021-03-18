require("js-math-tools").dump()
const KMeansCV = require("./k-means-cv.js")
const isMatrix = require("./is-matrix.js")
const subtract = (a, b) => add(a, scale(b, -1))
const divide = (a, b) => scale(a, pow(b, -1))

function normalize(x){
  assert(isMatrix(x), "`x` should be a matrix!")

  return transpose(
    transpose(x).map(row => {
      return divide(
        subtract(row, mean(row)),
        std(row)
      )
    })
  )
}

seed(12345)

let rows = 250
let cols = 15
let k = round(random() * 6) + 3
let centroids = normal([k, cols])

let x = []

for (let i=0; i<rows; i++){
  let c = centroids[parseInt(random() * centroids.length)]
  x.push(add(c, scale(0.1, normal(cols))))
}

x = normalize(x)

let kValues = range(1, 16)

let kmeans = new KMeansCV({
  kValues,
  maxRestarts: 10,
  maxIterations: 100,
  numberOfFolds: 4,
  shouldShuffle: false,
})

kmeans.fit(x, console.log)

console.log("======================")
console.log("actual k:", k)
console.log("learned k", kmeans.centroids.length)
