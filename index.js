require("js-math-tools").dump()
const KMeansCV = require("./k-means-cv.js")

let x = new DataFrame(normal(1000, 15))
let kmeans = new KMeansCV()
kmeans.fit(x).print()
