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

// plot data & centroids
const width = 512
const height = 512

let plot1 = new Plot(createCanvas(width, height))
plot1.setRange(-5, 5, -5, 5)

plot1.setDotSize(10)
plot1.setFillColor("red")
plot1.setLineThickness(0)
plot1.scatter(kmeans.centroids.map(c => c[0]), kmeans.centroids.map(c => c[1]))

plot1.setDotSize(2)
plot1.setFillColor("rgba(0, 0, 0, 1)")
plot1.scatter(x.values.map(v => v[0]), x.values.map(v => v[1]))

// plot error curve
let plot2 = new Plot(createCanvas(width, height))
plot2.setRange(-1, max(kValues.slice(0, scores.columns.length)) + 1, -0.1, max(scores.values))
plot2.setLineThickness(2)

scores.values.forEach(fold => {
  plot2.setLineColor("rgba(0, 0, 255, 0.25)")
  plot2.line(kValues.slice(0, fold.length), fold)
})

let meanScores = flatten(scores.apply(col => [mean(col)]).values)
plot2.setLineColor("black")
plot2.setLineThickness(2)
plot2.line(kValues.slice(0, meanScores.length), meanScores)

plot2.setTextStyle({
  family: "monospace",
  size: 10,
  alignment: "center",
  baseline: "middle",
  color: "black",
})

let tickSize = 0.05

kValues.forEach(k => {
  plot2.line([k, k], [-tickSize / 2, tickSize / 2])
})
