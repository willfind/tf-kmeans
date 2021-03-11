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

let theSeed = 11255 // round(random() * 10000) + 10000
seed(theSeed)

let k = round(random() * 6) + 3
let centroids = normal([k, 2])

// let centroids = range(0, k).map(i => {
//   let radius = 3
//
//   return [
//     radius * cos(i * 2 * Math.PI / k),
//     radius * sin(i * 2 * Math.PI / k)
//   ]
// })

let x = []

for (let i=0; i<100; i++){
  let c = centroids[parseInt(random() * centroids.length)]
  x.push(add(c, scale(0.1, normal(2))))
}

x = new DataFrame(x)
let kValues = range(1, 16)

let kmeans = new KMeansCV({
  kValues,
  maxIterations: 5,
  maxRestarts: 5,
  numberOfFolds: 4,
  shouldShuffle: false,
})

let scores = kmeans.fit(x, progress => console.log(progress.toFixed(2)))

console.log("learned k:", kmeans.centroids.length)
console.log("actual k:", k)
console.log("seed:", theSeed)

// if (kmeans.centroids.length >= k){
//   window.location.reload()
// }

// plot data & centroids
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
    type: "scatter",
    mode: "markers",
    marker: {
      color: "red",
      size: 15,
    },
  },

  {
    name: "data",
    x: x.get(null, 0).values,
    y: x.get(null, 1).values,
    type: "scatter",
    mode: "markers",
    marker: {
      color: "black",
      size: 4,
    },
  },
])
