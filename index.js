require("js-math-tools").dump()
const KMeansCV = require("./k-means-cv.js")
const plotly = require("plotly.js-dist")

const subtract = (a, b) => add(a, scale(b, -1))
const divide = (a, b) => scale(a, pow(b, -1))

function normalize(x){
  assert(x instanceof DataFrame, "`x` must be a DataFrame!")
  return x.apply(col => divide(subtract(col, mean(col)), std(col)))
}

// weird cases: 11255 w/ completely random; 10145 with 7 centroids in a circle
// new weird cases: 14413
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
x = normalize(x)

let kValues = range(1, 16)

let kmeans = new KMeansCV({
  kValues,
  maxRestarts: 5,
  maxIterations: 5,
  shouldShuffle: false,
  numberOfFolds: 4,
})

let scores = kmeans.fit(x, console.log)
console.log(scores)

console.log("seed:", theSeed)
console.log("actual k:", k)
console.log("learned k:", kmeans.centroids.length)

// plot
function createContainer(width, height){
  let container = document.createElement("div")
  container.style.width = `${width}px`
  container.style.height = `${height}px`
  document.body.appendChild(container)
  return container
}

const width = 512
const height = 512

plotly.newPlot(createContainer(width, height), [
  {
    name: "centroids",
    x: kmeans.centroids.map(c => c[0]),
    y: kmeans.centroids.map(c => c[1]),
    mode: "markers",
    type: "scatter",
    marker: {
      color: "red",
      size: 15,
    },
  },

  {
    name: "data",
    x: x.values.map(p => p[0]),
    y: x.values.map(p => p[1]),
    mode: "markers",
    type: "scatter",
    marker: {
      color: "black",
      size: 4,
    },
  },
])
