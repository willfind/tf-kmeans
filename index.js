require("js-math-tools").dump()
const KMeans = require("./k-means.js")
const KMeansCV = require("./k-means-cv.js")

let x = new DataFrame(normal([100, 15]))
let kmeans = new KMeans(7)
kmeans.fit(x)
