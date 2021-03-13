require("js-math-tools").dump()
const KMeansCV = require("./k-means-cv.js")
// const plotly = require("plotly.js-dist")

const subtract = (a, b) => add(a, scale(b, -1))
const divide = (a, b) => scale(a, pow(b, -1))

function normalize(x){
  assert(x instanceof DataFrame, "`x` must be a DataFrame!")
  return x.apply(col => divide(subtract(col, mean(col)), std(col)))
}

// weird cases: 11255 w/ completely random; 10145 with 7 centroids in a circle

let rScores = []
let actualKs = []
let learnedKs = []
let seeds = []

for (let iteration=0; iteration<100; iteration++){
  let theSeed = round(random() * 10000) + 10000
  seed(theSeed)
  let k = round(random() * 6) + 3
  let centroids = normal([k, 2])

  let x = []

  for (let i=0; i<100; i++){
    let c = centroids[parseInt(random() * centroids.length)]
    x.push(add(c, scale(0.1, normal(2))))
  }

  x = new DataFrame(x)
  normalize(x)

  let kValues = range(1, 16)

  let kmeans = new KMeansCV({
    kValues,
    maxIterations: 15,
    maxRestarts: 25,
    numberOfFolds: 4,
    shouldShuffle: false,
  })

  let scores = kmeans.fit(x)

  console.log("===============================")
  console.log("learned k:", kmeans.centroids.length)
  console.log("actual k:", k)
  console.log("seed:", theSeed)
  console.log("iteration:", iteration)

  seeds.push(theSeed)
  learnedKs.push(kmeans.centroids.length)
  actualKs.push(k)
}

let out = new DataFrame({seeds, learnedKs, actualKs})
out.toCSV("results.csv")
