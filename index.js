require("js-math-tools").dump()
const KMeans = require("./k-means.js")
const plotly = require("plotly.js-dist")

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

// weird cases: 11255 w/ completely random; 10145 with 7 centroids in a circle
let theSeed = round(random() * 10000) + 10000
seed(theSeed)
let k = round(random() * 6) + 3
let centroids = normal([k, cols])

let x = []

for (let i=0; i<rows; i++){
  let c = centroids[parseInt(random() * centroids.length)]
  x.push(add(c, scale(0.1, normal(cols))))
}

x = new DataFrame(x)
normalize(x)

let kmeans = new KMeans({k})
kmeans.fit(x, progress => console.log(progress.toFixed(2)))

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
