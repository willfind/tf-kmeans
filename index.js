require("js-math-tools").dump()
const { subtract, divide, isMatrix } = require("./helpers.js")
const KMeans = require("./k-means.js")

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

let kmeans = new KMeans({
  k,
  maxIterations: 100,
  maxRestarts: 25,
})

kmeans.fit(x).then(() => console.log("Done!"))
