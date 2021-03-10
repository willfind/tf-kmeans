require("js-math-tools").dump()
const KMeansCV = require("./k-means-cv.js")

function createCanvas(width, height){
  let canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  document.body.appendChild(canvas)
  return canvas
}

let k = 7

let centroids = range(0, k).map(i => {
  let radius = 3

  return [
    radius * cos(i * Math.PI * 2 / k),
    radius * sin(i * Math.PI * 2 / k),
  ]
})

let x = []

for (let i=0; i<100; i++){
  let c = centroids[parseInt(random() * centroids.length)]
  x.push(add(c, scale(0.1, normal(2))))
}

x = new DataFrame(x)

let kmeans = new KMeansCV({
  kValues: range(1, 16),
  maxIterations: 25,
  maxRestarts: 10,
  numberOfFolds: 10,
  shouldShuffle: false,
})

kmeans.fit(x)
console.log(kmeans.centroids.length)

let plot = new Plot(createCanvas(512, 512))
plot.setRange(-5, 5, -5, 5)

plot.setDotSize(10)
plot.setFillColor("red")
plot.setLineThickness(0)
plot.scatter(kmeans.centroids.map(c => c[0]), kmeans.centroids.map(c => c[1]))

plot.setDotSize(4)
plot.setFillColor("rgba(0, 0, 0, 0.1)")
plot.scatter(x.values.map(v => v[0]), x.values.map(v => v[1]))
