require("./all.js")
const KMeans = require("./k-means.js")
const KMeansPlusPlus = require("./k-means++.js")
const KMeansCV = require("./k-means-cv.js")
const plotly = require("plotly.js-dist")

function createContainer(width, height){
  let out = document.createElement("div")
  out.style.width = `${width}px`
  out.style.height = `${height}px`
  document.body.appendChild(out)
  return out
}

function normalize(x){
  return transpose(transpose(x).map(row => {
    return divide(subtract(row, mean(row)), std(row))
  }))
}

tf.setBackend("webgl")

tf.ready().then(() => {
  // seed(12345)

  let k = 5
  let rows = 100
  let cols = 2
  let centroids = normal([k, cols])
  let x = []

  for (let i=0; i<rows; i++){
    let point = centroids[parseInt(random() * centroids.length)]
    x.push(add(point, scale(0.1, normal(cols))))
  }

  x = normalize(x)

  let kmeans = new KMeansCV({
    kValues: range(1, 16),
    maxIterations: 15,
    maxRestarts: 5,
    numberOfFolds: 4,
    shouldShuffle: false,
    class: KMeansPlusPlus,
  })

  let startTime = new Date()
  kmeans.fit(x, console.log)

  kmeans.centroids.array().then(async (centroids) => {
    console.log("Done!")
    console.log((new Date() - startTime) / 1000, "seconds")

    // plot
    plotly.newPlot(createContainer(512, 512), [
      {
        name: "centroids",
        x: centroids.map(c => c[0]),
        y: centroids.map(c => c[1]),
        mode: "markers",
        type: "scatter",
        marker: {
          size: 15,
          color: "red",
        },
      },

      {
        name: "data",
        x: x.map(v => v[0]),
        y: x.map(v => v[1]),
        mode: "markers",
        type: "scatter",
        marker: {
          size: 4,
          color: "black",
        },
      },
    ])
  }).catch(e => {
    console.error(e)
  })
})
