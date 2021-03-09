require("js-math-tools").dump()
const KMeans = require("./k-means.js")

function createCanvas(width, height){
  let canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  document.body.appendChild(canvas)
  return canvas
}

seed(12345)

let k = 7
let centroids = normal([k, 2])
let x = []

for (let i=0; i<100; i++){
  let c = centroids[parseInt(random() * centroids.length)]
  x.push(add(c, scale(0.2, normal(2))))
}

x = new DataFrame(x)
let kmeans = new KMeans({k, maxIterations: 10, maxRestarts: 25})
kmeans.fit(x)

let plot = new Plot(createCanvas(512, 512))
plot.setRange(-5, 5, -5, 5)
plot.setDotSize(2)
plot.setFillColor("black")
plot.scatter(x.values.map(v => v[0]), x.values.map(v => v[1]))

plot.setDotSize(10)
plot.setFillColor("red")
plot.setLineThickness(0)
plot.scatter(kmeans.centroids.map(c => c[0]), kmeans.centroids.map(c => c[1]))
