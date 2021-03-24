require("./all.js")

function kmeans(x, k, maxIterations, maxRestarts){
  
}

let k = 5
let rows = 100
let cols = 2
let centroids = normal([k, cols])
let x = []

for (let i=0; i<rows; i++){
  let point = normal(cols)
  x.push(add(point, scale(0.1, normal(cols))))
}

let results = kmeans(x, k, 100, 25)
console.log(results)
