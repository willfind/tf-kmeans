require("./all.js")
const KMeans = require("./k-means.js")
const plotly = require("plotly.js-dist")

tf.setBackend("webgl")

tf.ready().then(() => {
  function createContainer(width, height){
    let out = document.createElement("div")
    out.style.width = `${width}px`
    out.style.height = `${height}px`
    document.body.appendChild(out)
    return out
  }

  seed(12345)

  let rows = 100
  let cols = 2
  let k = round(random() * 6) + 3
  let centroids = normal([k, cols])

  let x = []

  for (let i=0; i<rows; i++){
    let c = centroids[parseInt(random() * centroids.length)]
    x.push(add(c, scale(0.1, normal(cols))))
  }

  let kmeans = new KMeans({
    k,
    maxIterations: 100,
    maxRestarts: 25,
  })

  kmeans.fit(x).then(async () => {
    console.log("Done!")

    // plot
    let centroids = await kmeans.centroids.array()

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

    kmeans.destroy()
    console.log("Destroyed!")
  }).catch(e => {
    console.error(e)
    kmeans.destroy()
    console.log("Destroyed!")
  })
})
