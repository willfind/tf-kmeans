require("js-math-tools").dump()
const KMeansCV = require("./k-means-cv.js")

const subtract = (a, b) => add(a, scale(b, -1))
const divide = (a, b) => scale(a, pow(b, -1))

function createCanvas(width, height){
  let canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  document.body.appendChild(canvas)
  return canvas
}

function normalize(x){
  assert(x instanceof DataFrame, "`x` must be a DataFrame!")
  return x.apply(col => divide(subtract(col, mean(col)), std(col)))
}

let k = round(random() * 6) + 3
let centroids = normal([k, 2])
let x = []

for (let i=0; i<100; i++){
  let c = centroids[parseInt(random() * centroids.length)]
  x.push(add(c, scale(0.1, normal(2))))
}

x = new DataFrame(x)

let kmeans = new KMeansCV({
  kValues: range(1, 16),
  maxIterations: 5,
  maxRestarts: 5,
  numberOfFolds: 4,
  shouldShuffle: false,
})

kmeans.fit(x, progress => console.log(progress.toFixed(2)))

console.log("learned k:", kmeans.centroids.length)
console.log("actual k:", k)

let plot = new Plot(createCanvas(512, 512))
plot.setRange(-5, 5, -5, 5)

plot.setDotSize(10)
plot.setFillColor("red")
plot.setLineThickness(0)
plot.scatter(kmeans.centroids.map(c => c[0]), kmeans.centroids.map(c => c[1]))

plot.setDotSize(2)
plot.setFillColor("rgba(0, 0, 0, 1)")
plot.scatter(x.values.map(v => v[0]), x.values.map(v => v[1]))
