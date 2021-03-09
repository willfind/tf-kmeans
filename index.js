require("js-math-tools").dump()
const KMeans = require("./k-means.js")
const KMeansCV = require("./k-means-cv.js")

function createCanvas(width, height){
  let canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  document.body.appendChild(canvas)
  return canvas
}

let k = 7
let centroids = normal([k, 2])
let x = []

for (let i=0; i<100; i++){
  let c = centroids[parseInt(random() * centroids.length)]
  x.push(add(c, scale(0.5, normal(2))))
}

let kmeans = new KMeans(k)
kmeans.fit(new DataFrame(x))

let width = 400
let height = 400
let plot = new Plot(createCanvas(width, height))
plot.setRange(-5, 5, -5, 5)
plot.setDotSize(2)
plot.scatter(x.map(p => p[0]), x.map(p => p[1]))

plot.setFillColor("red")
plot.setDotSize(10)
plot.scatter(kmeans.centroids.map(c => c[0]), kmeans.centroids.map(c => c[1]))
