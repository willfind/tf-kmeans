require("js-math-tools").dump()
const KMeans = require("./k-means.js")
const KMeansPlusPlus = require("./k-means++.js")
const KMeansCV = require("./k-means-cv.js")

const subtract = (a, b) => add(a, scale(b, -1))
const divide = (a, b) => scale(a, pow(b, -1))

function normalize(x){
  assert(x instanceof DataFrame, "`x` must be a DataFrame!")
  return x.apply(col => divide(subtract(col, mean(col)), std(col)))
}

seed(12345)

let actualKs = []
let learnedKsNaive = []
let learnedKsPlusPlus = []

for (let iteration=0; iteration<100; iteration++){
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
  let config = {
    kValues,
    maxRestarts: 10,
    maxIterations: 300,
    numberOfFolds: 4,
    shouldShuffle: false,
  }

  let kMeansNaive = new KMeansCV({
    ...config,
    class: KMeans,
  })

  let kMeansPlusPlus = new KMeansCV({
    ...config,
    class: KMeansPlusPlus,
  })

  let naiveScores = kMeansNaive.fit(x)
  let plusPlusScores = kMeansPlusPlus.fit(x)

  console.log("======================")
  console.log("actual k:", k)
  console.log("learned k (naive):", kMeansNaive.centroids.length)
  console.log("learned k (++):", kMeansPlusPlus.centroids.length)
  console.log("iteration:", iteration)

  actualKs.push(k)
  learnedKsNaive.push(kMeansNaive.centroids.length)
  learnedKsPlusPlus.push(kMeansPlusPlus.centroids.length)
}

let out = new DataFrame({actualKs, learnedKsNaive, learnedKsPlusPlus})
out.toCSV("results.csv")
