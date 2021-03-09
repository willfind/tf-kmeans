(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
  x.push(add(c, scale(0.1, normal(2))))
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
plot.setDotSize(5)
plot.scatter(kmeans.centroids.map(c => c[0]), kmeans.centroids.map(c => c[1]))

},{"./k-means-cv.js":2,"./k-means.js":3,"js-math-tools":8}],2:[function(require,module,exports){
const KMeans = require("./k-means.js")

class KMeansCV {

}

try {
  module.exports = KMeansCV
} catch(e){}

},{"./k-means.js":3}],3:[function(require,module,exports){
const missingAwareDistance = require("./missing-aware-distance.js")
const makeKey = require("make-key")

class KMeans {
  constructor(k, maxIterations){
    let self = this
    self.k = k
    self.maxIterations = maxIterations || 100
    self.centroids = []
  }

  fit(x){
    assert(x instanceof DataFrame, "`x` must be a DataFrame!")

    let self = this
    x = x.copy()
    self.centroids = normal([self.k, x.shape[1]])
    let previousScore = self.score(x, self.predict(x))
    let scoreDelta = -1e20

    for (let i=0; i<self.maxIterations && scoreDelta < 0; i++){
      // assign each point to a centroid
      let labels = self.predict(x)
      let labelsID = makeKey(32)
      let xTemp = x.assign(labelsID, labels)

      // move each centroid to the average location of its assigned points
      self.centroids.forEach((centroid, i) => {
        try {
          self.centroids[i] = flatten(
            xTemp.filter(row => row[row.length - 2] === i)
            .drop(null, labelsID)
            .apply(col => [mean(col)])
            .values
          )
        } catch(e){}
      })

      // print score
      let newScore = self.score(x, labels)
      scoreDelta = newScore - previousScore
      previousScore = newScore
    }

    return self
  }

  score(x, labels){
    assert(x instanceof DataFrame, "`x` must be a DataFrame!")

    let self = this

    return sum(x.values.map((row, i) => {
      let centroid = self.centroids[labels[i]]
      return missingAwareDistance(centroid, row)
    }))
  }

  predict(x){
    assert(x instanceof DataFrame, "`x` must be a DataFrame!")

    let self = this

    return x.values.map(row => {
      let closestCentroidIndex = -1
      let smallestDistance = 1e20

      self.centroids.forEach((centroid, i) => {
        let d = missingAwareDistance(centroid, row)

        if (d < smallestDistance){
          smallestDistance = d
          closestCentroidIndex = i
        }
      })

      return closestCentroidIndex
    })
  }
}

try {
  module.exports = KMeans
} catch(e){}

},{"./missing-aware-distance.js":4,"make-key":83}],4:[function(require,module,exports){
const subtract = (a, b) => add(a, scale(b, -1))

function missingAwareDistance(a, b){
  assert(isArray(a), "`a` must be an array!")
  assert(isArray(b), "`b` must be an array!")
  assert(isEqual(shape(a), shape(b)), "`a` and `b` must have the same shape!")

  let aFlattened = flatten(a)
  let bFlattened = flatten(b)
  let aTemp = []
  let bTemp = []

  for (let i=0; i<aFlattened.length; i++){
    let aValue = aFlattened[i]
    let bValue = bFlattened[i]

    if (!isUndefined(aValue) && !isUndefined(bValue)){
      aTemp.push(aValue)
      bTemp.push(bValue)
    }
  }

  return sum(pow(subtract(aTemp, bTemp), 2))
}

try {
  module.exports = missingAwareDistance
} catch(e){}

},{}],5:[function(require,module,exports){
let out = {
  downloadCanvas: require("./download-canvas.js"),
  Plot: require("./plot.js"),
}

module.exports = out

},{"./download-canvas.js":6,"./plot.js":7}],6:[function(require,module,exports){
function downloadCanvas(canvas, filename){
  let a = document.createElement("a")
  a.href = canvas.toDataURL()
  a.download = filename
  a.dispatchEvent(new MouseEvent("click"))
}

module.exports = downloadCanvas

},{}],7:[function(require,module,exports){
let map = require("../math/map.js")
let max = require("../math/max.js")
let downloadCanvas = require("./download-canvas.js")
let assert = require("../misc/assert.js")
let isUndefined = require("../math/is-undefined.js")
let isNumber = require("../math/is-number.js")
let isString = require("../math/is-string.js")
let isBoolean = require("../math/is-boolean.js")
let isArray = require("../math/is-array.js")
let isEqual = require("../math/is-equal.js")
let shape = require("../math/shape.js")
let flatten = require("../math/flatten.js")
let distrib = require("../math/distrib.js")
let scale = require("../math/scale.js")

function Plot(canvas){
  assert(!isUndefined(canvas), "You must pass an HTML5 canvas element into the `Plot` constructor!")
  assert(canvas.constructor.name === "HTMLCanvasElement", "You must pass an HTML5 canvas element into the `Plot` constructor!")

  let self = this

  let xmin = -1
  let xmax = 1
  let ymin = -1
  let ymax = 1
  let fillColor = "black"
  let strokeColor = "black"
  let dotSize = 5
  let lineThickness = 1
  let axesAreVisible = true
  let textStyle = {
    family: "monospace",
    size: 12,
    alignment: "center",
    baseline: "middle",
    isBold: false,
    isItalicized: false,
    lineHeight: 14,
    color: "black",
  }

  let context = canvas.getContext("2d")
  let width = canvas.width
  let height = canvas.height

  self.setOpacity = function(a){
    assert(!isUndefined(a), "You must pass a number between 0 and 1 into the plot's `setOpacity` method!")
    assert(isNumber(a), "You must pass a number between 0 and 1 into the plot's `setOpacity` method!")
    assert(a >= 0 && a <= 1, "You must pass a number between 0 and 1 into the plot's `setOpacity` method!")

    context.globalAlpha = a
    return self
  }

  self.setFillColor = function(c){
    assert(!isUndefined(c), "You must pass a color string into the plot's `setFillColor` method!")
    assert(isString(c), "You must pass a color string into the plot's `setFillColor` method!")

    fillColor = c
    return self
  }

  self.setLineColor = function(c){
    assert(!isUndefined(c), "You must pass a color string into the plot's `setLineColor` method!")
    assert(isString(c), "You must pass a color string into the plot's `setLineColor` method!")

    strokeColor = c
    return self
  }

  self.setDotSize = function(s){
    assert(!isUndefined(s), "You must pass a positive number into the plot's `setDotSize` method!")
    assert(isNumber(s), "You must pass a positive number into the plot's `setDotSize` method!")
    assert(s >= 0, "You must pass a positive number into the plot's `setDotSize` method!")

    dotSize = s
    return self
  }

  self.setLineThickness = function(t){
    assert(!isUndefined(t), "You must pass a positive number into the plot's `setLineThickness` method!")
    assert(isNumber(t), "You must pass a positive number into the plot's `setLineThickness` method!")
    assert(t >= 0, "You must pass a positive number into the plot's `setLineThickness` method!")

    lineThickness = t
    return self
  }

  self.setAxesAreVisible = function(v){
    assert(!isUndefined(v), "You must pass a boolean value into the plot's `setAxesAreVisible` method!")
    assert(isBoolean(v), "You must pass a boolean value into the plot's `setAxesAreVisible` method!")

    axesAreVisible = v
    return self
  }

  self.setTextStyle = function(t){
    assert(!isUndefined(t), "You must pass a text style string into the plot's `setTextStyle` method!")

    textStyle = t
    return self
  }

  self.setRange = function(a, b, c, d){
    assert(!isUndefined(a), "You must pass four numbers into the plot's `setRange` method!")
    assert(!isUndefined(b), "You must pass four numbers into the plot's `setRange` method!")
    assert(!isUndefined(c), "You must pass four numbers into the plot's `setRange` method!")
    assert(!isUndefined(d), "You must pass four numbers into the plot's `setRange` method!")
    assert(isNumber(a), "You must pass four numbers into the plot's `setRange` method!")
    assert(isNumber(b), "You must pass four numbers into the plot's `setRange` method!")
    assert(isNumber(c), "You must pass four numbers into the plot's `setRange` method!")
    assert(isNumber(d), "You must pass four numbers into the plot's `setRange` method!")
    assert(a < b, "The xmin value must be less than the xmax value in the plot's `setRange` method!")
    assert(c < d, "The ymin value must be less than the ymax value in the plot's `setRange` method!")

    xmin = a
    xmax = b
    ymin = c
    ymax = d
    return self
  }

  self.splitTextIntoLines = function(text, maxWidth){
    assert(!isUndefined(text), "You must pass a string and a positive number into the plot's `splitTextIntoLines` method!")
    assert(isString(text), "You must pass a string and a positive number into the plot's `splitTextIntoLines` method!")
    assert(!isUndefined(maxWidth), "You must pass a string and a positive number into the plot's `splitTextIntoLines` method!")
    assert(isNumber(maxWidth), "You must pass a string and a positive number into the plot's `splitTextIntoLines` method!")
    assert(maxWidth >= 0, "You must pass a string and a positive number into the plot's `splitTextIntoLines` method!")

    let lines = []
    let words = text.split(" ")
    let temp = ""

    words.forEach(function(word){
      let width = context.measureText(temp + " " + word).width

      if (width > maxWidth){
        lines.push(temp)
        temp = word
      } else {
        if (temp.length === 0) temp += word
        else temp += " " + word
      }
    })

    if (temp.length > 0){
      lines.push(temp)
    }

    return lines
  }

  self.clear = function(){
    context.clearRect(0, 0, width, height)
    context.fillStyle = "white"
    context.fillRect(0, 0, width, height)
    return self
  }

  self.drawAxes = function(){
    if (axesAreVisible){
      context.fillStyle = "none"
      context.strokeStyle = "black"
      context.lineWidth = 1

      context.beginPath()
      context.moveTo(-width/2, map(0, ymin, ymax, -height/2, height/2))
      context.lineTo(width/2, map(0, ymin, ymax, -height/2, height/2))
      context.stroke()

      context.beginPath()
      context.moveTo(map(0, xmin, xmax, -width/2, width/2), -height/2)
      context.lineTo(map(0, xmin, xmax, -width/2, width/2), height/2)
      context.stroke()
    }

    return self
  }

  self.scatter = function(x, y){
    assert(!isUndefined(x), "You must pass two equally-sized one-dimensional arrays of numbers into the plot's `scatter` method!")
    assert(!isUndefined(y), "You must pass two equally-sized one-dimensional arrays of numbers into the plot's `scatter` method!")
    assert(isArray(x), "You must pass two equally-sized one-dimensional arrays of numbers into the plot's `scatter` method!")
    assert(isArray(y), "You must pass two equally-sized one-dimensional arrays of numbers into the plot's `scatter` method!")

    let xShape = shape(x)
    let yShape = shape(y)

    assert(xShape.length < 2, "You must pass two equally-sized one-dimensional arrays of numbers into the plot's `scatter` method!")
    assert(yShape.length < 2, "You must pass two equally-sized one-dimensional arrays of numbers into the plot's `scatter` method!")
    assert(isEqual(xShape, yShape), "You must pass two equally-sized one-dimensional arrays of numbers into the plot's `scatter` method!")

    context.save()
    context.translate(width/2, height/2)
    context.scale(1, -1)

    self.drawAxes()

    context.fillStyle = fillColor
    context.strokeStyle = strokeColor
    context.lineWidth = lineThickness

    for (let i=0; i<x.length; i++){
      xTemp = map(x[i], xmin, xmax, -width/2, width/2)
      yTemp = map(y[i], ymin, ymax, -height/2, height/2)

      context.beginPath()
      context.ellipse(xTemp, yTemp, dotSize / 2, dotSize / 2, 0, 0, Math.PI * 2)
      if (fillColor !== "none") context.fill()
      if (lineThickness > 0) context.stroke()
    }

    context.restore()
    return self
  }

  self.line = function(x, y){
    assert(!isUndefined(x), "You must pass two equally-sized one-dimensional arrays of numbers into the plot's `line` method!")
    assert(!isUndefined(y), "You must pass two equally-sized one-dimensional arrays of numbers into the plot's `line` method!")
    assert(isArray(x), "You must pass two equally-sized one-dimensional arrays of numbers into the plot's `line` method!")
    assert(isArray(y), "You must pass two equally-sized one-dimensional arrays of numbers into the plot's `line` method!")

    let xShape = shape(x)
    let yShape = shape(y)

    assert(xShape.length < 2, "You must pass two equally-sized one-dimensional arrays of numbers into the plot's `line` method!")
    assert(yShape.length < 2, "You must pass two equally-sized one-dimensional arrays of numbers into the plot's `line` method!")
    assert(isEqual(xShape, yShape), "You must pass two equally-sized one-dimensional arrays of numbers into the plot's `line` method!")

    context.save()
    context.translate(width/2, height/2)
    context.scale(1, -1)

    self.drawAxes()

    context.fillStyle = fillColor
    context.strokeStyle = strokeColor
    context.lineWidth = lineThickness

    for (let i=0; i<x.length-1; i++){
      xTemp1 = map(x[i], xmin, xmax, -width/2, width/2)
      yTemp1 = map(y[i], ymin, ymax, -height/2, height/2)
      xTemp2 = map(x[i+1], xmin, xmax, -width/2, width/2)
      yTemp2 = map(y[i+1], ymin, ymax, -height/2, height/2)

      context.beginPath()
      context.moveTo(xTemp1, yTemp1)
      context.lineTo(xTemp2, yTemp2)
      context.stroke()
    }

    context.restore()
    return self
  }

  self.dottedLine = function(x, y){
    assert(!isUndefined(x), "You must pass two equally-sized one-dimensional arrays of numbers into the plot's `dottedLine` method!")
    assert(!isUndefined(y), "You must pass two equally-sized one-dimensional arrays of numbers into the plot's `dottedLine` method!")
    assert(isArray(x), "You must pass two equally-sized one-dimensional arrays of numbers into the plot's `dottedLine` method!")
    assert(isArray(y), "You must pass two equally-sized one-dimensional arrays of numbers into the plot's `dottedLine` method!")

    let xShape = shape(x)
    let yShape = shape(y)

    assert(xShape.length < 2, "You must pass two equally-sized one-dimensional arrays of numbers into the plot's `dottedLine` method!")
    assert(yShape.length < 2, "You must pass two equally-sized one-dimensional arrays of numbers into the plot's `dottedLine` method!")
    assert(isEqual(xShape, yShape), "You must pass two equally-sized one-dimensional arrays of numbers into the plot's `dottedLine` method!")

    context.save()
    context.translate(width/2, height/2)
    context.scale(1, -1)

    self.drawAxes()

    context.fillStyle = fillColor
    context.strokeStyle = strokeColor
    context.lineWidth = lineThickness

    for (let i=0; i<x.length-1; i+=2){
      try {
        xTemp1 = map(x[i], xmin, xmax, -width/2, width/2)
        yTemp1 = map(y[i], ymin, ymax, -height/2, height/2)
        xTemp2 = map(x[i+1], xmin, xmax, -width/2, width/2)
        yTemp2 = map(y[i+1], ymin, ymax, -height/2, height/2)

        context.beginPath()
        context.moveTo(xTemp1, yTemp1)
        context.lineTo(xTemp2, yTemp2)
        context.stroke()
      } catch(e){}
    }

    context.restore()
    return self
  }

  self.bar = function(values, colors){
    assert(!isUndefined(values), "You must pass two equally-sized one-dimensional arrays into the plot's `bar` method: an array of numeric values and array of color strings!")
    assert(!isUndefined(colors), "You must pass two equally-sized one-dimensional arrays into the plot's `bar` method: an array of numeric values and array of color strings!")
    assert(isArray(values), "You must pass two equally-sized one-dimensional arrays into the plot's `bar` method: an array of numeric values and array of color strings!")
    assert(isArray(colors), "You must pass two equally-sized one-dimensional arrays into the plot's `bar` method: an array of numeric values and array of color strings!")

    let valuesShape = shape(values)
    let colorsShape = shape(colors)

    assert(valuesShape.length < 2, "You must pass two equally-sized one-dimensional arrays into the plot's `bar` method: an array of numeric values and array of color strings!")
    assert(colorsShape.length < 2, "You must pass two equally-sized one-dimensional arrays into the plot's `bar` method: an array of numeric values and array of color strings!")
    assert(isEqual(valuesShape, colorsShape), "You must pass two equally-sized one-dimensional arrays into the plot's `bar` method: an array of numeric values and array of color strings!")

    values.forEach(function(value){
      assert(isNumber(value), "You must pass two equally-sized one-dimensional arrays into the plot's `bar` method: an array of numeric values and array of color strings!")
    })

    colors.forEach(function(color){
      assert(isString(color), "You must pass two equally-sized one-dimensional arrays into the plot's `bar` method: an array of numeric values and array of color strings!")
    })

    let maxValue = max(values)
    self.setRange(1, 2 + values.length, -0.1 * maxValue, 1.1 * maxValue)

    context.save()
    context.translate(width/2, height/2)
    context.scale(1, -1)

    context.strokeStyle = strokeColor
    context.lineWidth = lineThickness

    let barThickness = 0.5

    for (let i=0; i<values.length; i++){
      context.fillStyle = colors[i]

      let xTemp = map((i + 2) - barThickness / 2, xmin, xmax, -width/2, width/2)
      let yTemp = map(0, ymin, ymax, -height/2, height/2)
      let wTemp = map(barThickness, 0, xmax - xmin, 0, width)
      let hTemp = map(values[i], 0, ymax - ymin, 0, height)

      if (colors[i] !== "none") context.fillRect(xTemp, yTemp, wTemp, hTemp)
      if (lineThickness > 0) context.strokeRect(xTemp, yTemp, wTemp, hTemp)
    }

    self.drawAxes()
    context.restore()
    return self
  }

  self.hist = function(x, bins, isDensity){
    assert(!isUndefined(x), "You must pass an array of numbers (and optionally an integer number of bins and a boolean that determines whether or not to display the histogram as a density plot) into the plot's `hist` method!")
    assert(isArray(x), "You must pass an array of numbers (and optionally an integer number of bins and a boolean that determines whether or not to display the histogram as a density plot) into the plot's `hist` method!")

    let temp = flatten(x)
    temp.forEach(v => assert(isNumber(v), "You must pass an array of numbers (and optionally an integer number of bins and a boolean that determines whether or not to display the histogram as a density plot) into the plot's `hist` method!"))

    if (isUndefined(bins)){
      bins = parseInt(Math.sqrt(temp.length))
    } else {
      assert(isNumber(bins), "You must pass an array of numbers (and optionally an integer number of bins and a boolean that determines whether or not to display the histogram as a density plot) into the plot's `hist` method!")
      assert(bins === parseInt(bins), "You must pass an array of numbers (and optionally an integer number of bins and a boolean that determines whether or not to display the histogram as a density plot) into the plot's `hist` method!")
    }

    if (isUndefined(isDensity)){
      isDensity = false
    } else {
      assert(isBoolean(isDensity), "You must pass an array of numbers (and optionally an integer number of bins and a boolean that determines whether or not to display the histogram as a density plot) into the plot's `hist` method!")
    }

    let y = distrib(temp, bins)

    context.save()
    context.translate(width/2, height/2)
    context.scale(1, -1)
    self.drawAxes()
    context.fillStyle = fillColor
    context.strokeStyle = strokeColor
    context.lineWidth = lineThickness

    temp = apply(temp, v => map(v, xmin, xmax, -width/2, width/2))
    let start = min(temp)
    let stop = max(temp)
    let step = (stop - start) / bins
    x = range(start, stop, step)
    y = apply(y, v => map(v, 0, ymax - ymin, 0, height))

    if (isDensity){
      y = apply(y, v => v / temp.length)
    }

    for (let i=0; i<x.length; i++){
      context.fillRect(x[i], map(0, ymin, ymax, -height/2, height/2), step, y[i])
      context.strokeRect(x[i], map(0, ymin, ymax, -height/2, height/2), step, y[i])
    }

    context.restore()
    return self
  }

  self.gkde = function(x, bandwidth, scalar, resolution){
    assert(!isUndefined(x), "You must pass an array of numbers (and optionally a numeric bandwidth value, a numeric scale value, and a numeric resolution value) into the plot's `gkde` method!")
    assert(isArray(x), "You must pass an array of numbers (and optionally a numeric bandwidth value, a numeric scale value, and a numeric resolution value) into the plot's `gkde` method!")

    let temp = flatten(x)
    temp.forEach(v => assert(isNumber(v), "You must pass an array of numbers (and optionally a numeric bandwidth value, a numeric scale value, and a numeric resolution value) into the plot's `gkde` method!"))

    if (isUndefined(bandwidth)){
      bandwidth = 0.5
    } else {
      assert(isNumber(bandwidth), "You must pass an array of numbers (and optionally a numeric bandwidth value, a numeric scale value, and a numeric resolution value) into the plot's `gkde` method!")
    }

    if (isUndefined(scalar)){
      scalar = 1
    } else {
      assert(isNumber(scalar), "You must pass an array of numbers (and optionally a numeric bandwidth value, a numeric scale value, and a numeric resolution value) into the plot's `gkde` method!")
    }

    if (isUndefined(resolution)){
      resolution = 50
    } else {
      assert(isNumber(resolution), "You must pass an array of numbers (and optionally a numeric bandwidth value, a numeric scale value, and a numeric resolution value) into the plot's `gkde` method!")
    }

    let k = vectorize(function(x, h){
      return Math.exp(-(x * x) / (2 * h * h))
    })

    let f = function(y, x, h){
      return apply(y, v => sum(k(scale(add(v, scale(x, -1)), 1 / h), h)))
    }

    let start = min(temp)
    let stop = max(temp)
    let step = (stop - start) / resolution
    x = range(start - step * 20, stop + step * 20, step)
    let y = f(x, temp, bandwidth)
    let yMin = min(y)
    let yMax = max(y)
    y = apply(y, v => map(v, yMin, yMax, 0, scalar))

    x = apply(x, v => map(v, xmin, xmax, -width/2, width/2))
    y = apply(y, v => map(v, ymin, ymax, -height/2, height/2))
    let yZero = map(0, ymin, ymax, -height/2, height/2)

    context.save()
    context.translate(width/2, height/2)
    context.scale(1, -1)
    self.drawAxes()

    context.beginPath()
    context.moveTo(x[0], yZero)
    context.lineTo(x[0], y[0])

    for (let i=0; i<x.length; i++){
      context.lineTo(x[i], y[i])
    }

    context.lineTo(x[x.length-1], yZero)
    context.fillStyle = fillColor
    context.strokeStyle = strokeColor
    context.lineWidth = lineThickness
    context.fill()
    context.stroke()
    context.restore()
    return self
  }

  self.text = function(text, x, y, rotation, maxWidth){
    assert(!isUndefined(text), "You must pass a string and two numbers for coordinates (and optionally a positive third number for the maximum width of the text) into the plot's `text` method!")
    assert(!isUndefined(x), "You must pass a string and two numbers for coordinates (and optionally a positive third number for the maximum width of the text) into the plot's `text` method!")
    assert(!isUndefined(y), "You must pass a string and two numbers for coordinates (and optionally a positive third number for the maximum width of the text) into the plot's `text` method!")

    assert(isString(text), "You must pass a string and two numbers for coordinates (and optionally a positive third number for the maximum width of the text) into the plot's `text` method!")
    assert(isNumber(x), "You must pass a string and two numbers for coordinates (and optionally a positive third number for the maximum width of the text) into the plot's `text` method!")
    assert(isNumber(y), "You must pass a string and two numbers for coordinates (and optionally a positive third number for the maximum width of the text) into the plot's `text` method!")

    if (!isUndefined(maxWidth)){
      assert(isNumber(maxWidth), "You must pass a string and two numbers for coordinates (and optionally a positive third number for the maximum width of the text) into the plot's `text` method!")
      assert(maxWidth >= 0, "You must pass a string and two numbers for coordinates (and optionally a positive third number for the maximum width of the text) into the plot's `text` method!")
    }

    context.save()
    context.translate(width/2, height/2)
    context.rotate(rotation)
    context.scale(1, -1)

    context.fillStyle = textStyle.color
    context.font = `${textStyle.isBold ? "bold" : ""} ${textStyle.isItalicized ? "italic" : ""} ${textStyle.size}px ${textStyle.family}`
    context.textAlign = textStyle.alignment
    context.textBaseline = textStyle.baseline

    let lines

    if (maxWidth){
      lines = self.splitTextIntoLines(text, map(maxWidth, 0, xmax - xmin, 0, width))
    } else {
      lines = [text]
    }

    lines.forEach(function(line, index){
      context.save()
      context.translate(map(x, xmin, xmax, -width/2, width/2), map(y, ymin, ymax, -height/2, height/2) - index * textStyle.lineHeight)
      context.scale(1, -1)
      context.fillText(line, 0, 0)
      context.restore()
    })

    context.restore()
    return self
  }

  self.getContext = function(){
    return context
  }

  self.download = function(filename){
    if (!isUndefined(filename)){
      assert(isString(filename), "You must pass a string (or nothing at all) into the plot's `download` method!")
    }

    filename = filename || "untitled.png"
    downloadCanvas(canvas, filename)
    return self
  }
}

module.exports = Plot

},{"../math/distrib.js":29,"../math/flatten.js":31,"../math/is-array.js":35,"../math/is-boolean.js":36,"../math/is-equal.js":37,"../math/is-number.js":39,"../math/is-string.js":40,"../math/is-undefined.js":41,"../math/map.js":44,"../math/max.js":45,"../math/scale.js":58,"../math/shape.js":61,"../misc/assert.js":78,"./download-canvas.js":6}],8:[function(require,module,exports){
let out = {
  canvas: require("./canvas/__index__.js"),
  math: require("./math/__index__.js"),
  misc: require("./misc/__index__.js"),
}

out.dump = function(){
  out.misc.dump(out.canvas)
  out.misc.dump(out.math)
  out.misc.dump(out.math.classes)
  out.misc.dump(out.misc)
}

try {
  module.exports = out
} catch(e){}

try {
  window.JSMathTools = out
} catch(e){}

},{"./canvas/__index__.js":5,"./math/__index__.js":9,"./misc/__index__.js":75}],9:[function(require,module,exports){
let out = {
  abs: require("./abs.js"),
  add: require("./add.js"),
  append: require("./append.js"),
  arccos: require("./arccos.js"),
  arcsin: require("./arcsin.js"),
  arctan: require("./arctan.js"),
  ceil: require("./ceil.js"),
  chop: require("./chop.js"),
  clamp: require("./clamp.js"),
  classes: require("./classes/__index__.js"),
  cohensd: require("./cohens-d.js"),
  copy: require("./copy.js"),
  correl: require("./correl.js"),
  cos: require("./cos.js"),
  count: require("./count.js"),
  covariance: require("./covariance.js"),
  distance: require("./distance.js"),
  distrib: require("./distrib.js"),
  dot: require("./dot.js"),
  flatten: require("./flatten.js"),
  floor: require("./floor.js"),
  identity: require("./identity.js"),
  inverse: require("./inverse.js"),
  isArray: require("./is-array.js"),
  isBoolean: require("./is-boolean.js"),
  isEqual: require("./is-equal.js"),
  isFunction: require("./is-function.js"),
  isNumber: require("./is-number.js"),
  isString: require("./is-string.js"),
  isUndefined: require("./is-undefined.js"),
  lerp: require("./lerp.js"),
  log: require("./log.js"),
  map: require("./map.js"),
  max: require("./max.js"),
  mean: require("./mean.js"),
  median: require("./median.js"),
  min: require("./min.js"),
  mode: require("./mode.js"),
  ndarray: require("./ndarray.js"),
  normal: require("./normal.js"),
  ones: require("./ones.js"),
  pow: require("./pow.js"),
  random: require("./random.js"),
  range: require("./range.js"),
  reverse: require("./reverse.js"),
  round: require("./round.js"),
  scale: require("./scale.js"),
  seed: require("./seed.js"),
  set: require("./set.js"),
  shape: require("./shape.js"),
  shuffle: require("./shuffle.js"),
  sign: require("./sign.js"),
  sin: require("./sin.js"),
  slice: require("./slice.js"),
  sort: require("./sort.js"),
  sqrt: require("./sqrt.js"),
  std: require("./std.js"),
  sum: require("./sum.js"),
  tan: require("./tan.js"),
  transpose: require("./transpose.js"),
  variance: require("./variance.js"),
  vectorize: require("./vectorize.js"),
  zeros: require("./zeros.js"),
}

module.exports = out

},{"./abs.js":10,"./add.js":11,"./append.js":12,"./arccos.js":13,"./arcsin.js":14,"./arctan.js":15,"./ceil.js":16,"./chop.js":17,"./clamp.js":18,"./classes/__index__.js":19,"./cohens-d.js":22,"./copy.js":23,"./correl.js":24,"./cos.js":25,"./count.js":26,"./covariance.js":27,"./distance.js":28,"./distrib.js":29,"./dot.js":30,"./flatten.js":31,"./floor.js":32,"./identity.js":33,"./inverse.js":34,"./is-array.js":35,"./is-boolean.js":36,"./is-equal.js":37,"./is-function.js":38,"./is-number.js":39,"./is-string.js":40,"./is-undefined.js":41,"./lerp.js":42,"./log.js":43,"./map.js":44,"./max.js":45,"./mean.js":46,"./median.js":47,"./min.js":48,"./mode.js":49,"./ndarray.js":50,"./normal.js":51,"./ones.js":52,"./pow.js":53,"./random.js":54,"./range.js":55,"./reverse.js":56,"./round.js":57,"./scale.js":58,"./seed.js":59,"./set.js":60,"./shape.js":61,"./shuffle.js":62,"./sign.js":63,"./sin.js":64,"./slice.js":65,"./sort.js":66,"./sqrt.js":67,"./std.js":68,"./sum.js":69,"./tan.js":70,"./transpose.js":71,"./variance.js":72,"./vectorize.js":73,"./zeros.js":74}],10:[function(require,module,exports){
let assert = require("../misc/assert.js")
let vectorize = require("./vectorize.js")
let isArray = require("./is-array.js")
let isNumber = require("./is-number.js")
let isUndefined = require("./is-undefined.js")

let abs = vectorize(function(x){
  assert(!isUndefined(x), "You must pass exactly one number into the `abs` function!")
  assert(isNumber(x), "The `abs` function only works on numbers!")
  return Math.abs(x)
})

module.exports = abs

// tests
if (!module.parent && typeof(window) === "undefined"){
  let result = abs(3)
  assert(result === 3, `abs(3) should be 3, but instead is ${result}!`)

  result = abs(-3)
  assert(result === 3, `abs(-3) should be 3, but instead is ${result}!`)

  result = abs(17.25)
  assert(result === 17.25, `abs(17.25) should be 17.25, but instead is ${result}!`)

  result = abs(-101.5)
  assert(result === 101.5, `abs(-101.5) should be 101.5, but instead is ${result}!`)

  x = [-2, 3, -4]
  yTrue = [2, 3, 4]
  yPred = abs(x)

  for (let i=0; i<yTrue.length; i++){
    assert(yTrue[i] === yPred[i], `abs(${x[i]}) should be ${yTrue[i]}, but instead is ${yPred[i]}!`)
  }

  x = [
    [1, -2, -3],
    [4, -5, 6],
    [-7, 8, -9],
  ]

  yTrue = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ]

  yPred = abs(x)

  for (let r=0; r<yTrue.length; r++){
    for (let c=0; c<yTrue[r].length; c++){
      assert(yTrue[r][c] === yPred[r][c], `abs(${x[r][c]}) should be ${yTrue[r][c]}, but instead is ${yPred[r][c]}!`)
    }
  }

  let hasFailed

  try {
    hasFailed = false
    abs("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `abs("foo") should have failed!`)

  try {
    hasFailed = false
    abs(["foo", "bar", "baz"])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `abs(["foo", "bar", "baz"]) should have failed!`)

  try {
    hasFailed = false
    abs({x: 5})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `abs({x: 5}) should have failed!`)

  try {
    hasFailed = false
    abs(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `abs(true) should have failed!`)

  let foo

  try {
    hasFailed = false
    abs(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `abs(foo) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./is-array.js":35,"./is-number.js":39,"./is-undefined.js":41,"./vectorize.js":73}],11:[function(require,module,exports){
let assert = require("../misc/assert.js")
let vectorize = require("./vectorize.js")
let isNumber = require("./is-number.js")
let isString = require("./is-string.js")
let isUndefined = require("./is-undefined.js")

let add = vectorize(function(){
  let out = 0
  let argKeys = Object.keys(arguments)
  let argValues = argKeys.map(key => arguments[key])
  let argTypes = argValues.map(value => typeof(value))

  argValues.forEach(value => assert(isNumber(value) || isString(value), "The `add` function only works on strings or numbers!"))

  argValues.forEach(value => assert(!isUndefined(value), "You must pass numbers or equally-sized arrays of numbers into the `add` function!"))

  if (argTypes.indexOf("string") > -1) out = ""

  argValues.forEach(x => out += x)

  return out
})

module.exports = add

// tests
if (!module.parent && typeof(window) === "undefined"){
  let a = 3
  let b = 4
  cTrue = a + b
  cPred = add(a, b)
  assert(cTrue === cPred, `add(${a}, ${b}) should be ${cTrue}, but instead is ${cPred}!`)

  a = -4
  b = 22.5
  cTrue = a + b
  cPred = add(a, b)
  assert(cTrue === cPred, `add(${a}, ${b}) should be ${cTrue}, but instead is ${cPred}!`)

  a = [2, 3, 4]
  b = -10
  cTrue = [-8, -7, -6]
  cPred = add(a, b)
  for (let i=0; i<cTrue.length; i++) assert(cTrue[i] === cPred[i], `add(${a[i]}, ${b}) should be ${cTrue[i]}, but instead is ${cPred[i]}!`)

  a = -10
  b = [2, 3, 4]
  cTrue = [-8, -7, -6]
  cPred = add(a, b)
  for (let i=0; i<cTrue.length; i++) assert(cTrue[i] === cPred[i], `add(${a}, ${b[i]}) should be ${cTrue[i]}, but instead is ${cPred[i]}!`)

  a = [2, 3, 4]
  b = [5, 6, 7]
  cTrue = [7, 9, 11]
  cPred = add(a, b)
  for (let i=0; i<cTrue.length; i++) assert(cTrue[i] === cPred[i], `add(${a[i]}, ${b[i]}) should be ${cTrue[i]}, but instead is ${cPred[i]}!`)

  a = [[2, 3, 4], [5, 6, 7]]
  b = 10
  cTrue = [[12, 13, 14], [15, 16, 17]]
  cPred = add(a, b)

  for (let row=0; row<cTrue.length; row++){
    for (let col=0; col<cTrue[row].length; col++){
      assert(cTrue[row][col] === cPred[row][col], `add(${a[row][col]}, ${b}) should be ${cTrue[row][col]}, but instead is ${cPred[row][col]}!`)
    }
  }

  a = [[2, 3, 4], [5, 6, 7]]
  b = [10, 20, 30]
  let hasFailed

  try {
    hasFailed = false
    add(a, b)
  } catch(e){
    hasFailed = true
  }

  if (!hasFailed) assert(false, `add(${a}, ${b}) should have failed!`)

  a = "hello, "
  b = ["foo", "bar", "baz"]
  cTrue = ["hello, foo", "hello, bar", "hello, baz"]
  cPred = add(a, b)
  for (let i=0; i<cTrue.length; i++) assert(cTrue[i] === cPred[i], `add(${a}, ${b[i]}) should be ${cTrue[i]}, but instead is ${cPred[i]}!`)

  a = true
  b = 3

  try {
    hasFailed = false
    add(a, b)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `add(${a}, ${b}) should have failed!`)

  a = [2, 3, 4]
  b = [5, 6, "seven"]
  cTrue = [7, 9, "4seven"]
  cPred = add(a, b)
  for (let i=0; i<cTrue.length; i++) assert(cTrue[i] === cPred[i], `add(${a[i]}, ${b[i]}) should be ${cTrue[i]}, but instead was ${cPred[i]}!`)

  let foo

  try {
    hasFailed = false
    add(3, foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `add(3, foo) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./is-number.js":39,"./is-string.js":40,"./is-undefined.js":41,"./vectorize.js":73}],12:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isArray = require("./is-array.js")
let isNumber = require("./is-number.js")
let shape = require("./shape.js")
let slice = require("./slice.js")
let transpose = require("./transpose.js")

function append(a, b, axis=0){
  assert(!isUndefined(a), "You must pass two arrays into the `append` function!")
  assert(!isUndefined(b), "You must pass two arrays into the `append` function!")
  assert(isArray(a), "You must pass two arrays into the `append` function!")
  assert(isArray(b), "You must pass two arrays into the `append` function!")
  assert(isNumber(axis), "The `axis` argument to the `append` function must be 0 or 1!")
  assert(axis >= 0 && axis < 2, "The `axis` argument to the `append` function must be 0 or 1!")
  assert(parseInt(axis) === axis, "The `axis` argument to the `append` function must be 0 or 1!")

  let aShape = shape(a)
  let bShape = shape(b)

  assert(aShape.length === bShape.length, "The two arrays passed into the `append` function must have the same number of dimensions!")
  assert(aShape.length < 3 && bShape.length < 3, "The two arrays passed into the `append` function must be 1- or 2-dimensional!")

  for (let i=0; i<aShape.length; i++){
    if (i !== axis){
      assert(aShape[i] === bShape[i], `The two arrays passed into the \`append\` function must have the same shapes along all axes *except* the axis along which they're being appended! (${aShape[i]} != ${bShape[i]})`)
    }
  }

  assert(axis < aShape.length, "The axis argument you passed into the `append` function is out of bounds for the array!")

  if (aShape.length === 0){
    return []
  } else if (aShape.length === 1){
    return a.concat(b)
  } else if (aShape.length === 2){
    if (axis === 0){
      let out = []
      for (let i=0; i<aShape[0]; i++) out.push(a[i])
      for (let i=0; i<bShape[0]; i++) out.push(b[i])
      return out
    } else if (axis === 1){
      return transpose(append(transpose(a), transpose(b), 0))
    }
  }
}

module.exports = append

// tests
if (!module.parent && typeof(window) === "undefined"){
  let isEqual = require("./is-equal.js")
  let normal = require("./normal.js")
  let range = require("./range.js")

  function printArray(x){
    return `[${x.join(", ")}]`
  }

  let a = [2, 3, 4]
  let b = [5, 6, 7]
  let axis = 0
  let yTrue = [2, 3, 4, 5, 6, 7]
  let yPred = append(a, b, axis)
  assert(isEqual(yTrue, yPred), `append(${printArray(a)}, ${printArray(b)}) should be ${printArray(yTrue)}, but instead was ${printArray(yPred)}!`)

  a = [[2, 3, 4]]
  b = [[5, 6, 7]]
  axis = 0
  yTrue = [[2, 3, 4], [5, 6, 7]]
  yPred = append(a, b, axis)
  assert(isEqual(yTrue, yPred), `append(${printArray(a)}, ${printArray(b)}) should be ${printArray(yTrue)}, but instead was ${printArray(yPred)}!`)

  a = [[2, 3, 4]]
  b = [[5, 6, 7]]
  axis = 1
  yTrue = [[2, 3, 4, 5, 6, 7]]
  yPred = append(a, b, axis)
  assert(isEqual(yTrue, yPred), `append(${printArray(a)}, ${printArray(b)}) should be ${printArray(yTrue)}, but instead was ${printArray(yPred)}!`)

  yTrue = normal([10, 5])
  a = slice(yTrue, [range(0, 3), null])
  b = slice(yTrue, [range(3, 10), null])
  axis = 0
  yPred = append(a, b, axis)
  assert(isEqual(yTrue, yPred), `FAIL when appending 2D matrices on axis 0!`)

  yTrue = normal([5, 10])
  a = slice(yTrue, [null, range(0, 3)])
  b = slice(yTrue, [null, range(3, 10)])
  axis = 1
  yPred = append(a, b, axis)
  assert(isEqual(yTrue, yPred), `FAIL when appending 2D matrices on axis 1!`)

  let hasFailed

  try {
    hasFailed = false
    append()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `append() should have failed!`)

  try {
    hasFailed = false
    append(normal([2, 3]), normal([4, 5]), 0)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `append(normal([2, 3]), normal([4, 5]), 0) should have failed!`)

  try {
    hasFailed = false
    append(normal([3, 3]), normal([3, 2]), 0)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `append(normal([3, 3]), normal([3, 2]), 0) should have failed!`)

  try {
    hasFailed = false
    append(normal([3, 2]), normal([2, 2]), 1)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `append(normal([3, 2]), normal([2, 2]), 1) should have failed!`)

  try {
    hasFailed = false
    append(normal([5, 5], normal([5, 5])), 2)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `append(normal([5, 5]), normal([5, 5]), 2) should have failed!`)

  try {
    hasFailed = false
    append(normal([2, 3, 4]), normal([2, 3, 4]), 0)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `append(normal([2, 3, 4]), normal([2, 3, 4]), 0) should have failed!`)

  console.log("All tests passed! (But I should probably make `append` compatible with (n > 2)-dimensional arrays!)")
}

},{"../misc/assert.js":78,"./is-array.js":35,"./is-equal.js":37,"./is-number.js":39,"./is-undefined.js":41,"./normal.js":51,"./range.js":55,"./shape.js":61,"./slice.js":65,"./transpose.js":71}],13:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isNumber = require("./is-number.js")
let vectorize = require("./vectorize.js")

let arccos = vectorize(function(x){
  assert(!isUndefined(x), "You must pass a number or an array of numbers into the `arccos` function!")
  assert(isNumber(x), "You must pass a number or an array of numbers into the `arccos` function!")
  assert(x >= -1 && x <= 1, "The `arccos` function is only defined for -1 <= x <= 1!")
  return Math.acos(x)
})

module.exports = arccos

// tests
if (!module.parent && typeof(window) === "undefined"){
  let random = require("./random.js")

  let x = 0
  let yTrue = Math.PI / 2
  let yPred = arccos(x)
  assert(yTrue === yPred, `arccos(${x}) should be ${yTrue}, but instead is ${yPred}!`)

  x = 1
  yTrue = 0
  yPred = arccos(x)
  assert(yTrue === yPred, `arccos(${x}) should be ${yTrue}, but instead is ${yPred}!`)

  let hasFailed

  try {
    hasFailed = false
    arccos()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `arccos() should have failed!`)

  try {
    hasFailed = false
    arccos("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `arccos("foo") should have failed!`)

  try {
    hasFailed = false
    arccos(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `arccos(true) should have failed!`)

  try {
    hasFailed = false
    arccos(-2)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `arccos(-2) should have failed!`)

  try {
    hasFailed = false
    arccos(2)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `arccos(2) should have failed!`)

  try {
    hasFailed = false
    arccos({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `arccos({}) should have failed!`)

  try {
    hasFailed = false
    arccos(random(100))
  } catch(e){
    hasFailed = true
  }

  assert(!hasFailed, `arccos(random(100)) should have succeeded!`)

  try {
    hasFailed = false
    arccos(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `arccos(() => {}) should have failed!`)

  try {
    let foo
    hasFailed = false
    arccos(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `arccos(foo) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./is-number.js":39,"./is-undefined.js":41,"./random.js":54,"./vectorize.js":73}],14:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isNumber = require("./is-number.js")
let vectorize = require("./vectorize.js")

let arcsin = vectorize(function(x){
  assert(!isUndefined(x), "You must pass a number or an array of numbers into the `arcsin` function!")
  assert(isNumber(x), "You must pass a number or an array of numbers into the `arcsin` function!")
  assert(x >= -1 && x <= 1, "The `arcsin` function is only defined for -1 <= x <= 1!")
  return Math.asin(x)
})

module.exports = arcsin

// tests
if (!module.parent && typeof(window) === "undefined"){
  let random = require("./random.js")

  let x = 0
  let yTrue = 0
  let yPred = arcsin(x)
  assert(yTrue === yPred, `arcsin(${x}) should be ${yTrue}, but instead is ${yPred}!`)

  x = 1
  yTrue = Math.PI / 2
  yPred = arcsin(x)
  assert(yTrue === yPred, `arcsin(${x}) should be ${yTrue}, but instead is ${yPred}!`)

  let hasFailed

  try {
    hasFailed = false
    arcsin()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `arcsin() should have failed!`)

  try {
    hasFailed = false
    arcsin("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `arcsin("foo") should have failed!`)

  try {
    hasFailed = false
    arcsin(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `arcsin(true) should have failed!`)

  try {
    hasFailed = false
    arcsin(-2)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `arcsin(-2) should have failed!`)

  try {
    hasFailed = false
    arcsin(2)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `arcsin(2) should have failed!`)

  try {
    hasFailed = false
    arcsin({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `arcsin({}) should have failed!`)

  try {
    hasFailed = false
    arcsin(random(100))
  } catch(e){
    hasFailed = true
  }

  assert(!hasFailed, `arcsin(random(100)) should have succeeded!`)

  try {
    hasFailed = false
    arcsin(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `arcsin(() => {}) should have failed!`)

  try {
    let foo
    hasFailed = false
    arcsin(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `arcsin(foo) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./is-number.js":39,"./is-undefined.js":41,"./random.js":54,"./vectorize.js":73}],15:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isNumber = require("./is-number.js")
let vectorize = require("./vectorize.js")

let arctan = vectorize(function(x){
  assert(!isUndefined(x), "You must pass a number or an array of numbers into the `arctan` function!")
  assert(isNumber(x), "You must pass a number or an array of numbers into the `arctan` function!")
  return Math.atan(x)
})

module.exports = arctan

// tests
if (!module.parent && typeof(window) === "undefined"){
  let random = require("./random.js")

  let x = 0
  let yTrue = 0
  let yPred = arctan(x)
  assert(yTrue === yPred, `arctan(${x}) should be ${yTrue}, but instead is ${yPred}!`)

  x = 1
  yTrue = Math.PI / 4
  yPred = arctan(x)
  assert(yTrue === yPred, `arctan(${x}) should be ${yTrue}, but instead is ${yPred}!`)

  let hasFailed

  try {
    hasFailed = false
    arctan()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `arctan() should have failed!`)

  try {
    hasFailed = false
    arctan("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `arctan("foo") should have failed!`)

  try {
    hasFailed = false
    arctan(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `arctan(true) should have failed!`)

  try {
    hasFailed = false
    arctan(-2)
  } catch(e){
    hasFailed = true
  }

  assert(!hasFailed, `arctan(-2) should have succeeded!`)

  try {
    hasFailed = false
    arctan(2)
  } catch(e){
    hasFailed = true
  }

  assert(!hasFailed, `arctan(2) should have succeeded!`)

  try {
    hasFailed = false
    arctan({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `arctan({}) should have failed!`)

  try {
    hasFailed = false
    arctan(random(100))
  } catch(e){
    hasFailed = true
  }

  assert(!hasFailed, `arctan(random(100)) should have succeeded!`)

  try {
    hasFailed = false
    arctan(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `arctan(() => {}) should have failed!`)

  try {
    let foo
    hasFailed = false
    arctan(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `arctan(foo) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./is-number.js":39,"./is-undefined.js":41,"./random.js":54,"./vectorize.js":73}],16:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isNumber = require("./is-number.js")
let isUndefined = require("./is-undefined.js")
let vectorize = require("./vectorize.js")

let ceil = vectorize(function(x){
  assert(!isUndefined(x), "You must pass a single number or a single array of numbers into the `ceil` function!")
  assert(isNumber(x), "The `ceil` function only works on numbers!")
  return Math.ceil(x)
})

module.exports = ceil

// tests
if (!module.parent && typeof(window) === "undefined"){
  let x = 3.5
  let yTrue = 4
  let yPred = ceil(x)
  assert(yTrue === yPred, `ceil(${x}) should be ${yTrue}, but instead was ${yPred}!`)

  x = 3.25
  yTrue = 4
  yPred = ceil(x)
  assert(yTrue === yPred, `ceil(${x}) should be ${yTrue}, but instead was ${yPred}!`)

  x = -17.2
  yTrue = -17
  yPred = ceil(x)
  assert(yTrue === yPred, `ceil(${x}) should be ${yTrue}, but instead was ${yPred}!`)

  x = [2.5, 3.4, 7.9]
  yTrue = [3, 4, 8]
  yPred = ceil(x)
  for (let i=0; i<yTrue.length; i++) assert(yTrue[i] === yPred[i], `ceil(${x[i]}) should be ${yTrue[i]}, but instead was ${yPred[i]}!`)

  let hasFailed
  x = "foo"

  try {
    hasFailed = false
    ceil(x)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `ceil(${x}) should have failed!`)

  x = [true, 2, 3]

  try {
    hasFailed = false
    ceil(x)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `ceil(${x}) should have failed!`)

  x = {x: 5}

  try {
    hasFailed = false
    ceil(x)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `ceil(${x}) should have failed!`)

  let foo

  try {
    hasFailed = false
    ceil(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `ceil(foo) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./is-number.js":39,"./is-undefined.js":41,"./vectorize.js":73}],17:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isNumber = require("./is-number.js")
let isUndefined = require("./is-undefined.js")
let abs = require("./abs.js")
let vectorize = require("./vectorize.js")

let chop = vectorize(function(x, threshold){
  assert(!isUndefined(x), "You must pass a single number or a single array of numbers into the `chop` function!")
  assert(isNumber(x), "The `chop` function only works on numbers!")

  threshold = isUndefined(threshold) ? 1e-10 : threshold
  assert(isNumber(threshold), "The `chop` function only works on numbers!")

  return abs(x) < threshold ? 0 : x
})

module.exports = chop

// tests
if (!module.parent && typeof(window) === "undefined"){
  let x = 1
  let y = chop(x)
  assert(y === 1, `chop(1) should be 1, but instead is ${y}!`)

  x = 0
  y = chop(x)
  assert(y === 0, `chop(0) should be 0, but instead is ${y}!`)

  x = 1e-15
  y = chop(x)
  assert(y === 0, `chop(1e-15) should be 0, but instead is ${y}!`)

  x = 100
  y = chop(x)
  assert(y === 100, `chop(100) should be 100, but instead is ${y}!`)

  x = -100
  y = chop(x)
  assert(y === -100, `chop(-100) should be -100, but instead is ${y}!`)

  x = [1e-20, 1e-15, 1e-5]
  let yTrue = [0, 0, 1e-5]
  yPred = chop(x)
  for (let i=0; i<yTrue.length; i++) assert(yTrue[i] === yPred[i], `chop(x[i]) should be ${yTrue[i]}, but instead is ${yPred[i]}!`)

  x = [1, 1, 1]
  thresholds = [1e-1, 1e0, 1e1]
  yTrue = [1, 1, 0]
  yPred = chop(x, thresholds)
  for (let i=0; i<yTrue.length; i++) assert(yTrue[i] === yPred[i], `chop(x[i]) should be ${yTrue[i]}, but instead is ${yPred[i]}!`)

  let hasFailed

  try {
    hasFailed = false
    chop(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `chop(true) should have failed!`)

  try {
    hasFailed = false
    chop({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `chop({}) should have failed!`)

  try {
    hasFailed = false
    chop("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `chop("foo") should have failed!`)

  try {
    hasFailed = false
    chop(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `chop(() => {})) should have failed!`)

  try {
    hasFailed = false
    chop([1, 2, "three"])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `chop([1, 2, "three"]) should have failed!`)

  try {
    let foo
    hasFailed = false
    chop(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `chop(foo) should have failed!`)

  try {
    hasFailed = false
    chop([2, 3, 4], [5, 6, "seven"])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `chop([2, 3, 4], [5, 6, "seven"]) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./abs.js":10,"./is-number.js":39,"./is-undefined.js":41,"./vectorize.js":73}],18:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isNumber = require("./is-number.js")
let isUndefined = require("./is-undefined.js")
let vectorize = require("./vectorize.js")

let clamp = vectorize(function(x, a, b){
  assert(!isUndefined(x) && !isUndefined(a) && !isUndefined(b), "You must pass exactly three numbers (or three equally-sized arrays of numbers) into the `clamp` function!")

  assert(isNumber(x), "The `clamp` function only works on numbers!")
  assert(isNumber(a), "The `clamp` function only works on numbers!")
  assert(isNumber(b), "The `clamp` function only works on numbers!")

  assert(a < b, `The minimum parameter, a, must be less than the maximum parameter, b.`)

  if (x < a) return a
  if (x > b) return b
  return x
})

module.exports = clamp

// tests
if (!module.parent && typeof(window) === "undefined"){
  let x = 5
  let a = 1
  let b = 10
  let yTrue = 5
  let yPred = clamp(x, a, b)
  assert(yTrue === yPred, `clamp(${x}, ${a}, ${b}) should be ${yTrue}, but instead is ${yPred}!`)

  x = -100
  a = 1
  b = 10
  yTrue = a
  yPred = clamp(x, a, b)
  assert(yTrue === yPred, `clamp(${x}, ${a}, ${b}) should be ${yTrue}, but instead is ${yPred}!`)

  x = 999
  a = 1
  b = 10
  yTrue = b
  yPred = clamp(x, a, b)
  assert(yTrue === yPred, `clamp(${x}, ${a}, ${b}) should be ${yTrue}, but instead is ${yPred}!`)

  x = [0, 100, 1000]
  a = 5
  b = 500
  yTrue = [5, 100, 500]
  yPred = clamp(x, a, b)
  for (let i=0; i<yTrue.length; i++) assert(yTrue[i] === yPred[i], `clamp(${x[i]}, ${a}, ${b}) should be ${yTrue[i]}, but instead was ${yPred[i]}!`)

  x = [0, 100, 1000]
  a = [5, 10, 15]
  b = [100, 200, 300]
  yTrue = [5, 100, 300]
  yPred = clamp(x, a, b)
  for (let i=0; i<yTrue.length; i++) assert(yTrue[i] === yPred[i], `clamp(${x[i]}, ${a[i]}, ${b[i]}) should be ${yTrue[i]}, but instead was ${yPred[i]}.`)

  x = 5
  a = 10
  b = 1
  let hasFailed = false

  try {
    clamp(x, a, b)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `clamp(${x}, ${a}, ${b}) should have failed!`)

  x = "foo"
  a = "bar"
  b = "baz"
  hasFailed = false

  try {
    clamp(x, a, b)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `clamp(${x}, ${a}, ${b}) should have failed!`)

  let foo
  hasFailed = false

  try {
    clamp(foo, foo, foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `clamp(foo, foo, foo) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./is-number.js":39,"./is-undefined.js":41,"./vectorize.js":73}],19:[function(require,module,exports){
let out = {
  DataFrame: require("./dataframe.js"),
  Series: require("./series.js"),
}

module.exports = out

},{"./dataframe.js":20,"./series.js":21}],20:[function(require,module,exports){
(function (process){(function (){
let assert = require("../../misc/assert.js")
let isArray = require("../is-array.js")
let isUndefined = require("../is-undefined.js")
let shape = require("../shape.js")
let transpose = require("../transpose.js")
let range = require("../range.js")
let isNumber = require("../is-number.js")
let isString = require("../is-string.js")
let apply = require("../../misc/apply.js")
let isFunction = require("../is-function.js")
let ndarray = require("../ndarray.js")
let copy = require("../copy.js")
let Series = require("./series.js")
let flatten = require("../flatten.js")
let isEqual = require("../is-equal.js")
let max = require("../max.js")
let min = require("../min.js")
let set = require("../set.js")
let isBoolean = require("../is-boolean.js")
let random = require("../random.js")
let sort = require("../sort.js")

function isInteger(x){
  return isNumber(x) && parseInt(x) === x
}

function isWholeNumber(x){
  return isInteger(x) && x >= 0
}

function isObject(x){
  return x instanceof Object && !isArray(x)
}

function isDataFrame(x){
  return x instanceof DataFrame
}

function isSeries(x){
  return x instanceof Series
}

function quote(s){
  let pattern = /"(.*?)"/g
  let matches = s.match(pattern)
  let out = s.slice()

  if (matches){
    matches.forEach(item => {
      out = out.replace(item, `“${item.substring(1, item.length-1)}”`)
    })
  }

  pattern = /'(.*?)'/g
  matches = s.match(pattern)

  if (matches){
    matches.forEach(item => {
      out = out.replace(item, `‘${item.substring(1, item.length-1)}’`)
    })
  }

  return `"${out}"`
}

function leftPad(x, maxLength){
  assert(isNumber(x), "The `leftPad` function only works on numbers!")
  let out = x.toString()
  while (out.length < maxLength) out = "0" + out
  return out
}

class DataFrame {
  constructor(data){
    let self = this

    Object.defineProperty(self, "_values", {
      value: [],
      configurable: true,
      enumerable: false,
      writable: true,
    })

    Object.defineProperty(self, "values", {
      configurable: true,
      enumerable: true,

      get(){
        return self._values
      },

      set(x){
        assert(isArray(x), "The new values must be a 2-dimensional array!")

        let dataShape = shape(x)
        assert(dataShape.length === 2, "The new array of values must be 2-dimensional!")

        if (dataShape[0] < self._index.length){
          self._index = self._index.slice(0, dataShape[0])
        } else if (dataShape[0] > self._index.length){
          self._index = self._index.concat(range(self._index.length, dataShape[0]).map(i => "row" + leftPad(i, (dataShape[0] - 1).toString().length)))
        }

        if (dataShape[1] < self._columns.length){
          self._columns = self._columns.slice(0, dataShape[1])
        } else if (dataShape[1] > self._columns.length){
          self._columns = self._columns.concat(range(self._columns.length, dataShape[1]).map(i => "col" + leftPad(i, (dataShape[1] - 1).toString().length)))
        }

        self._values = x
      },
    })

    Object.defineProperty(self, "_columns", {
      value: [],
      configurable: true,
      enumerable: false,
      writable: true,
    })

    Object.defineProperty(self, "columns", {
      configurable: true,
      enumerable: true,

      get(){
        return self._columns
      },

      set(x){
        assert(isArray(x), "The new columns list must be a 1-dimensional array of strings!")
        assert(x.length === self.shape[1], "The new columns list must be the same length as the old columns list!")
        assert(shape(x).length === 1, "The new columns list must be a 1-dimensional array of strings!")

        x.forEach(value => {
          assert(isString(value), "All of the column names must be strings!")
        })

        self._columns = x
      },
    })

    Object.defineProperty(self, "_index", {
      value: [],
      configurable: true,
      enumerable: false,
      writable: true,
    })

    Object.defineProperty(self, "index", {
      configurable: true,
      enumerable: true,

      get(){
        return self._index
      },

      set(x){
        assert(isArray(x), "The new index must be a 1-dimensional array of strings!")
        assert(x.length === self.shape[0], "The new index must be the same length as the old index!")
        assert(shape(x).length === 1, "The new index must be a 1-dimensional array of strings!")

        x.forEach(value => {
          assert(isString(value), "All of the row names must be strings!")
        })

        self._index = x
      },
    })

    assert(isUndefined(data) || data instanceof Object, "The `data` passed into the constructor of a DataFrame must be either (1) an object where the key-value pairs are (respectively) column names and 1-dimensional arrays of values, or (2) a 2-dimensional array of values.")

    if (data){
      if (isArray(data)){
        let dataShape = shape(data)
        assert(dataShape.length === 2, "The `data` array passed into the constructor of a DataFrame must be 2-dimensional!")
        self.values = data
      } else {
        self._columns = Object.keys(data)
        let temp = []

        self._columns.forEach(col => {
          let values = data[col]
          temp.push(values)
        })

        self._values = transpose(temp)

        let dataShape = shape(self.values)
        self._index = range(0, dataShape[0]).map(i => "row" + leftPad(i, (dataShape[0] - 1).toString().length))
      }
    }
  }

  get shape(){
    let self = this
    return shape(self.values)
  }

  get rows(){
    let self = this
    return self.index
  }

  set rows(rows){
    let self = this
    self.index = rows
  }

  isEmpty(){
    let self = this
    return set(self.values).filter(v => !isUndefined(v)).length === 0
  }

  clear(){
    let self = this
    let out = self.copy()
    out.values = ndarray(out.shape)
    out.index = self.index
    out.columns = self.columns
    return out
  }

  get(rows, cols){
    let self = this

    if (isString(rows) || isNumber(rows)) rows = [rows]
    if (isString(cols) || isNumber(cols)) cols = [cols]

    let types = set((rows || []).concat(cols || []).map(v => typeof v))
    assert(types.length <= 2, "Only whole numbers and/or strings are allowed in `get` arrays!")

    if (types.length === 1){
      assert(types[0] === "string" || types[0] === "number", "Only whole numbers and/or strings are allowed in `get` arrays!")
    }

    if (types.length === 2){
      assert(types.indexOf("string") > -1, "Only whole numbers and/or strings are allowed in `get` arrays!")
      assert(types.indexOf("number") > -1, "Only whole numbers and/or strings are allowed in `get` arrays!")
    }

    if (!isUndefined(rows)){
      rows = rows.map(r => {
        if (typeof r === "string"){
          assert(self.index.indexOf(r) > -1, `Row "${r}" does not exist!`)
          return r
        }

        if (typeof r === "number"){
          assert(r >= 0, `Index ${r} is out of bounds!`)
          assert(parseInt(r) === r, `Row numbers must be integers!`)
          assert(r < self.index.length, `Index ${r} is out of bounds!`)
          return self.index[r]
        }
      })
    }

    if (!isUndefined(cols)){
      cols = cols.map(c => {
        if (typeof c === "string"){
          assert(self.columns.indexOf(c) > -1, `Column "${c}" does not exist!`)
          return c
        }

        if (typeof c === "number"){
          assert(c >= 0, `Column ${c} is out of bounds!`)
          assert(parseInt(c) === c, `Column numbers must be integers!`)
          assert(c < self.columns.length, `Column ${c} is out of bounds!`)
          return self.columns[c]
        }
      })
    }

    return self.getSubsetByNames(rows, cols)
  }

  getSubsetByNames(rows, cols){
    let self = this

    if (isUndefined(rows)) rows = self.index
    if (isUndefined(cols)) cols = self.columns

    assert(isArray(rows) && isArray(cols), "The `rows` and `cols` parameters must be 1-dimensional arrays of strings.")
    assert(shape(rows).length === 1 && shape(cols).length === 1, "The `rows` and `cols` parameters must be 1-dimensional arrays of strings.")
    assert(rows.length > 0, "The `rows` array must contain at least one row name.")
    assert(cols.length > 0, "The `cols` array must contain at least one column name.")

    rows.forEach(row => {
      assert(isString(row), "The `rows` and `cols` parameters must be 1-dimensional arrays of strings.")
      assert(self.index.indexOf(row) > -1, `The row name "${row}" does not exist in the list of rows.`)
    })

    cols.forEach(col => {
      assert(isString(col), "The `rows` and `cols` parameters must be 1-dimensional arrays of strings.")
      assert(self.columns.indexOf(col) > -1, `The column name "${col}" does not exist in the list of columns.`)
    })

    let values = rows.map(row => {
      return cols.map(col => {
        return self.values[self.index.indexOf(row)][self.columns.indexOf(col)]
      })
    })

    if (rows.length === 1 && cols.length === 1){
      return flatten(values)[0]
    }

    if (rows.length === 1){
      let out = new Series(flatten(values))
      out.name = rows[0]
      out.index = cols
      return out
    }

    if (cols.length === 1){
      let out = new Series(flatten(values))
      out.name = cols[0]
      out.index = rows
      return out
    }

    let out = new DataFrame(values)
    out.columns = cols
    out.index = rows
    return out
  }

  getSubsetByIndices(rowIndices, colIndices){
    let self = this
    let dataShape = self.shape

    if (isUndefined(rowIndices)) rowIndices = range(0, dataShape[0])
    if (isUndefined(colIndices)) colIndices = range(0, dataShape[1])

    assert(isArray(rowIndices) && isArray(colIndices), "The `rowIndices` and `colIndices` parameters must be 1-dimensional arrays of whole numbers.")
    assert(shape(rowIndices).length === 1 && shape(colIndices).length === 1, "The `rowIndices` and `colIndices` parameters must be 1-dimensional arrays of whole numbers.")
    assert(rowIndices.length > 0, "The `rowIndices` array must contain at least one index.")
    assert(colIndices.length > 0, "The `colIndices` array must contain at least one index.")

    rowIndices.forEach(rowIndex => {
      assert(isWholeNumber(rowIndex), "The `rowIndices` and `colIndices` parameters must be 1-dimensional arrays of whole numbers.")
      assert(rowIndex < self.index.length, `The row index ${rowIndex} is out of bounds.`)
    })

    colIndices.forEach(colIndex => {
      assert(isWholeNumber(colIndex), "The `rowIndices` and `colIndices` parameters must be 1-dimensional arrays of whole numbers.")
      assert(colIndex < self.columns.length, `The column index ${colIndex} is out of bounds.`)
    })

    let rows = rowIndices.map(i => self.index[i])
    let cols = colIndices.map(i => self.columns[i])
    return self.getSubsetByNames(rows, cols)
  }

  loc(rows, cols){
    let self = this
    return self.getSubsetByNames(rows, cols)
  }

  iloc(rowIndices, colIndices){
    let self = this
    return self.getSubsetByIndices(rowIndices, colIndices)
  }

  transpose(){
    let self = this
    let out = new DataFrame(transpose(self.values))
    out.columns = self.index
    out.index = self.columns
    return out
  }

  get T(){
    let self = this
    return self.transpose()
  }

  resetIndex(){
    let self = this
    let out = self.copy()
    out.index = range(0, self.shape[0]).map(i => "row" + leftPad(i, (out.index.length - 1).toString().length))
    return out
  }

  copy(){
    let self = this
    if (self.isEmpty()) return new DataFrame()
    let out = new DataFrame(copy(self.values))
    out.columns = self.columns.slice()
    out.index = self.index.slice()
    return out
  }

  assign(p1, p2){
    let name, obj

    if (isUndefined(p2)){
      obj = p1

      assert(!isArray(obj), "When using only one parameter for the `assign` method, the parameter must be an object or a Series.")
    } else {
      name = p1
      obj = p2

      assert(isString(name), "When using two parameters for the `assign` method, the first parameter must be a string.")
      assert(isSeries(obj) || (isArray(obj) && shape(obj).length === 1), "When using two parameters for the `assign` method, the second parameter must be a Series or a 1-dimensional array.")
    }

    assert(isObject(obj) || isSeries(obj) || (isArray(obj) && shape(obj).length === 1), "An object, Series, or 1-dimensional array must be passed into the `assign` method.")

    let self = this

    if (isSeries(obj)){
      let temp = {}
      assert (self.isEmpty() || isEqual(obj.index, self.index), "The index of the new data does not match the index of the DataFrame.")
      temp[name || obj.name] = obj.values
      return self.assign(temp)
    } else if (isArray(obj)){
      let temp = {}
      temp[name || "data"] = obj
      return self.assign(temp)
    } else {
      let out = self.copy()
      let outShape = out.shape

      Object.keys(obj).forEach(col => {
        let values = obj[col]

        assert(isArray(values), "Each key-value pair must be (respectively) a string and a 1-dimensional array of values.")
        assert(shape(values).length === 1, "Each key-value pair must be (respectively) a string and a 1-dimensional array of values.")

        if (out.isEmpty()){
          out.values = transpose([values])
          out.columns = [col]
          outShape = out.shape
        } else {
          assert(values.length === outShape[0], `Column "${col}" in the new data is not the same length as the other columns in the original DataFrame.`)

          let colIndex = out.columns.indexOf(col)

          if (colIndex < 0){
            out.columns.push(col)
            colIndex = out.columns.indexOf(col)
          }

          out.values.forEach((row, i) => {
            row[colIndex] = values[i]
          })
        }
      })

      return out
    }
  }

  apply(fn, axis){
    axis = axis || 0

    assert(isFunction(fn), "The first parameter to the `apply` method must be a function.")
    assert(axis === 0 || axis === 1, "The second parameter to the `apply` method (the `axis`) must be 0 or 1.")

    let self = this
    let out = self.copy()

    if (axis === 0){
      out = out.transpose()

      out.values = out.values.map((col, i) => {
        return fn(col, out.index[i])
      })

      out = out.transpose()
    } else if (axis === 1){
      out.values = out.values.map((row, i) => {
        return fn(row, out.index[i])
      })
    }

    return out
  }

  map(fn, axis){
    let self = this
    return self.apply(fn, axis)
  }

  dropMissing(axis, condition, threshold){
    axis = axis || 0
    assert(axis === 0 || axis === 1, "The first parameter of the `dropMissing` method (the `axis`) must be 0 or 1.")

    threshold = threshold || 0
    assert(isWholeNumber(threshold), "The third parameter of the `dropMissing` method (the `threshold`) should be a whole number (meaning that data should be dropped if it contains more than `threshold` null values).")

    condition = threshold > 0 ? "none" : (condition || "any")
    assert(condition === "any" || condition === "all" || condition === "none", "The second parameter of the `dropMissing` method (the `condition` parameter, which indicates the condition under which data should be dropped) should be 'any' or 'all' (meaning that if 'any' of the data contains null values, then it should be dropped; or that if 'all' of the data contains null values, then it should be dropped).")

    function helper(values){
      if (threshold > 0){
        let count = 0

        for (let i=0; i<values.length; i++){
          let value = values[i]
          if (isUndefined(value)) count++
          if (count >= threshold) return []
        }
      } else if (condition === "any"){
        for (let i=0; i<values.length; i++){
          let value = values[i]
          if (isUndefined(value)) return []
        }
      } else if (condition === "all"){
        for (let i=0; i<values.length; i++){
          let value = values[i]
          if (!isUndefined(value)) return values
        }

        return []
      }

      return values
    }

    let self = this
    let out = self.copy()
    let tempID = Math.random().toString()

    if (axis === 0){
      out = out.assign(tempID, out.index)

      let newValues = out.values.map(helper).filter(row => row.length > 0)

      if (shape(newValues).length < 2) return new DataFrame()

      out.values = newValues

      let newIndex = out.get(null, tempID)
      if (isUndefined(newIndex)) return new DataFrame()
      if (isString(newIndex)) newIndex = [newIndex]
      if (isSeries(newIndex)) newIndex = newIndex.values
      out.index = newIndex
      out = out.drop(null, tempID)
    } else if (axis === 1){
      out = out.transpose()
      out = out.assign(tempID, out.index)

      let newValues = out.values.map(helper).filter(col => col.length > 0)

      if (shape(newValues).length < 2) return new DataFrame()

      out.values = newValues

      let newIndex = out.get(null, tempID)
      if (isUndefined(newIndex)) return new DataFrame()
      if (isString(newIndex)) newIndex = [newIndex]
      if (isSeries(newIndex)) newIndex = newIndex.values
      out.index = newIndex
      out = out.drop(null, tempID)
      out = out.transpose()
    }

    return out
  }

  drop(rows, cols){
    let self = this

    if (isUndefined(rows)) rows = []
    if (isUndefined(cols)) cols = []
    if (isString(rows) || isNumber(rows)) rows = [rows]
    if (isString(cols) || isNumber(cols)) cols = [cols]

    assert(isArray(rows), "The `drop` method only works on 1-dimensional arrays of numerical indices and/or strings.")
    assert(isArray(cols), "The `drop` method only works on 1-dimensional arrays of numerical indices and/or strings.")
    assert(shape(rows).length === 1, "The `drop` method only works on 1-dimensional arrays of numerical indices and/or strings.")
    assert(shape(cols).length === 1, "The `drop` method only works on 1-dimensional arrays of numerical indices and/or strings.")

    let out = self.copy()

    rows = rows.map(row => {
      if (isString(row)){
        assert(out.index.indexOf(row) > -1, `Row "${row}" does not exist!`)
        return row
      }

      if (isNumber(row)){
        assert(row >= 0, `Row ${row} is out of bounds!`)
        assert(row < out.index.length, `Row ${row} is out of bounds!`)
        return out.index[row]
      }
    })

    cols = cols.map(col => {
      if (isString(col)){
        assert(out.columns.indexOf(col) > -1, `Column "${col}" does not exist!`)
        return col
      }

      if (isNumber(col)){
        assert(col >= 0, `Column ${col} is out of bounds!`)
        assert(col < out.columns.length, `Column ${col} is out of bounds!`)
        return out.columns[col]
      }
    })

    out = out.dropRows(rows)
    out = out.dropColumns(cols)
    return out
  }

  dropColumns(columns){
    let self = this
    if (isUndefined(columns)) columns = []
    if (isNumber(columns) || isString(columns)) columns = [columns]

    assert(isArray(columns), "`columns` must be an array of strings.")
    assert(shape(columns).length === 1, "`columns` must be a 1-dimensional array of strings.")

    columns = columns.map(col => {
      if (isString(col)){
        assert(self.columns.indexOf(col) > -1, `Column "${col}" does not exist!`)
        return col
      }

      if (isNumber(col)){
        assert(col >= 0, `Column ${col} is out of bounds!`)
        assert(col < self.columns.length, `Column ${col} is out of bounds!`)
        return self.columns[col]
      }
    })

    let out = self.copy()
    let outColumns = copy(out.columns)

    columns.forEach(col => {
      let index = outColumns.indexOf(col)
      assert(index > -1, `The column "${col}" does not exist!`)

      outColumns.splice(index, 1)

      out.values = out.values.map(row => {
        row.splice(index, 1)
        return row
      })
    })

    if (set(out.values).length === 0) return new DataFrame()
    out.columns = outColumns
    return out
  }

  dropRows(rows){
    let self = this
    if (isUndefined(rows)) rows = []
    if (isNumber(rows) || isString(rows)) rows = [rows]

    assert(isArray(rows), "`rows` must be an array of strings.")
    assert(shape(rows).length === 1, "`rows` must be a 1-dimensional array of strings.")

    rows = rows.map(row => {
      if (isString(row)){
        assert(self.index.indexOf(row) > -1, `Row "${row}" does not exist!`)
        return row
      }

      if (isNumber(row)){
        assert(row >= 0, `Row ${row} is out of bounds!`)
        assert(row < self.index.length, `Row ${row} is out of bounds!`)
        return self.index[row]
      }
    })

    let out = self.copy()
    let outIndex = copy(out.index)

    rows.forEach(row => {
      let index = outIndex.indexOf(row)
      assert(index > -1, `The row "${row}" does not exist!`)

      outIndex.splice(index, 1)
      out.values.splice(index, 1)
    })

    if (set(out.values).length === 0) return new DataFrame()
    out.index = outIndex
    return out
  }

  toObject(){
    let self = this
    let out = {}

    self.values.forEach((row, i) => {
      let temp = {}

      row.forEach((value, j) => {
        temp[self.columns[j]] = value
      })

      out[self.index[i]] = temp
    })

    return out
  }

  toCSVString(){
    let self = this
    let index = ["(index)"].concat(copy(self.index))
    let columns = copy(self.columns)

    let out = [columns].concat(self.values).map((row, i) => {
      return [index[i]].concat(row).map(value => {
        if (typeof value === "string"){
          return quote(value)
        } else {
          return value
        }
      }).join(",")
    }).join("\n")

    return out
  }

  toCSV(filename){
    let self = this
    let out = self.toCSVString()

    // browser
    if (typeof window !== "undefined"){
      if (filename.includes("/")){
        let parts = filename.split("/")
        filename = parts[parts.length - 1]
      }

      let a = document.createElement("a")
      a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(out)}`
      a.download = filename
      a.dispatchEvent(new MouseEvent("click"))
    }

    // node
    else {
      let fs = require("fs")
      let path = require("path")
      fs.writeFileSync(path.resolve(filename), out, "utf8")
    }

    return self
  }

  print(){
    let self = this
    let temp = self.copy()
    let maxColumns = typeof window === "undefined" ?  Math.floor(process.stdout.columns / 24) - 1 : 10
    let maxRows = typeof window === "undefined" ? 20 : 10

    if (temp.columns.length > maxColumns){
      temp = temp.getSubsetByNames(null, temp.columns.slice(0, maxColumns / 2).concat(temp.columns.slice(temp.columns.length - maxColumns / 2, temp.columns.length)))
      let newColumns = temp.columns

      temp = temp.assign({"...": range(0, temp.index.length).map(i => "...")})
      temp = temp.loc(null, newColumns.slice(0, newColumns.length / 2).concat(["..."]).concat(newColumns.slice(newColumns.length / 2, newColumns.length)))
    }

    if (temp.index.length > maxRows){
      temp = temp.getSubsetByIndices(range(0, maxRows / 2).concat(range(temp.index.length - maxRows / 2, temp.index.length)), null)
      let newIndex = temp.index

      temp.index.push("...")
      temp.values.push(range(0, temp.columns.length).map(i => "..."))
      temp = temp.loc(newIndex.slice(0, newIndex.length / 2).concat(["..."]).concat(newIndex.slice(newIndex.length / 2, newIndex.length)), null)
    }

    console.table(temp.toObject())
    return self
  }

  sort(cols, directions){
    let self = this

    // temporarily assign index as column in dataframe
    let out = self.copy()
    let indexID = random().toString()
    out = out.assign(indexID, out.index)

    if (isUndefined(cols)){
      cols = [indexID]
      directions = [true]
    }

    if (isNumber(cols) || isString(cols)){
      cols = [cols]
      if (isBoolean(directions) || isString(directions)) directions = [directions]
    }

    assert(isArray(cols), "The first parameter of the `sort` method must be (1) a string or index representing a column name or index, respectively; (2) a 1-dimensional array of strings and/or indices; or (3) null.")
    assert(shape(cols).length === 1, "The first parameter of the `sort` method must be (1) a string or index representing a column name or index, respectively; (2) a 1-dimensional array of strings and/or indices; or (3) null.")

    if (isUndefined(directions)) directions = range(0, cols.length).map(i => true)

    assert(isArray(directions), "The second parameter of the `sort` method must be (1) a string or boolean representing the sort direction ('ascending' / 'descending', or true / false); (2) a 1-dimensional array of strings and/or booleans; or (3) null.")
    assert(shape(directions).length === 1, "The second parameter of the `sort` method must be (1) a string or boolean representing the sort direction ('ascending' / 'descending', or true / false); (2) a 1-dimensional array of strings and/or booleans; or (3) null.")

    assert(cols.length === directions.length, "The arrays passed into the `sort` method must be equal in length.")

    // convert all columns to indices
    cols = cols.map(col => {
      assert(isString(col) || isNumber(col), "Column references can either be column names (as strings) or column indices (as whole numbers).")

      if (isString(col)){
        let index = out.columns.indexOf(col)
        assert(index > -1, `The column "${col}" does not exist!`)
        return index
      }

      if (isNumber(col)){
        assert(parseInt(col) === col, "Column indices must be whole numbers!")
        assert(col >= 0, `The column index ${col} is out of bounds!`)
        assert(col < out.columns.length, `The index ${col} is out of bounds!`)
        return col
      }
    })

    // convert all directions to booleans
    directions = directions.map(dir => {
      assert(isString(dir) || isBoolean(dir), "Direction references can either be strings ('ascending' or 'descending') or booleans (true or false).")

      if (isString(dir)){
        let value = dir.trim().toLowerCase()
        assert(value === "ascending" || value === "descending", "Direction references can either be strings ('ascending' or 'descending') or booleans (true or false).")
        return value === "ascending"
      }

      if (isBoolean(dir)){
        return dir
      }
    })

    // sort
    out.values = sort(out.values, (a, b) => {
      let counter = 0

      while(a[cols[counter]] === b[cols[counter]] && counter < cols.length){
        counter++
      }

      let isAscending = directions[counter]
      if (a[cols[counter]] === b[cols[counter]]) return 0
      if (a[cols[counter]] < b[cols[counter]]) return (isAscending ? -1 : 1)
      if (a[cols[counter]] > b[cols[counter]]) return (isAscending ? 1 : -1)
    })

    out.index = flatten(out.get(null, indexID).values)
    out = out.dropColumns(indexID)
    return out
  }

  sortByIndex(){
    let self = this
    return self.sort()
  }

  filter(fn, axis){
    assert(isFunction(fn), "The `filter` method takes a single parameter: a function that is used to filter the values.")

    if (isUndefined(axis)) axis = 0
    assert(axis === 0 || axis === 1, "The `axis` parameter to the `filter` method must be 0 or 1.")

    let self = this
    if (self.isEmpty()) return self.copy()
    let out = self.copy()
    let index = copy(out.index)
    let columns = copy(out.columns)

    if (axis === 0){
      let indexID = Math.random().toString()
      out = out.assign(indexID, out.index)

      let newValues = out.values.filter((row, i) => {
        let shouldKeep = fn(row, i, out)
        if (!shouldKeep) index.splice(i, 1)
        return shouldKeep
      })

      if (flatten(newValues).length === 0) return new DataFrame()
      if (shape(newValues).length === 1) newValues = [newValues]

      out.values = newValues
      out.index = out.get(null, indexID).values
      out = out.drop(null, indexID)
    } else if (axis === 1){
      out = out.transpose()

      let columnsID = Math.random().toString()
      out = out.assign(columnsID, out.index)

      let newValues = out.values.filter((row, i) => {
        let shouldKeep = fn(row, i, out)
        if (!shouldKeep) columns.splice(i, 1)
        return shouldKeep
      })

      if (flatten(newValues).length === 0) return new DataFrame()
      if (shape(newValues).length === 1) newValues = [newValues]

      out.values = newValues
      out.index = out.get(null, columnsID).values
      out = out.drop(null, columnsID)
      out = out.transpose()
    }

    return out
  }
}

module.exports = DataFrame

// tests
if (!module.parent && typeof(window) === "undefined"){
  let isEqual = require("../is-equal.js")
  let normal = require("../normal.js")
  let flatten = require("../flatten.js")
  let distance = require("../distance.js")
  let zeros = require("../zeros.js")
  let chop = require("../chop.js")
  let print = require("../../misc/print.js")

  let xShape = [17, 32]
  let x = normal(xShape)
  let df = new DataFrame(x)

  assert(isDataFrame(df), "`df` is not a DataFrame!")
  assert(isEqual(df.shape, xShape), "The shape of the DataFrame is not the same as the shape of its data!")
  assert(!df.isEmpty(), "`df` should not be empty!")
  assert((new DataFrame()).isEmpty(), "New DataFrames should be empty!")

  let clearedValues = set(df.clear().values)
  assert(clearedValues.length === 1 && isUndefined(clearedValues[0]), "Cleared DataFrames should only have `undefined` values.")

  let a = normal(100)
  let b = normal(100)
  let c = normal(100)
  df = new DataFrame({a, b, c})
  let dfShape = df.shape

  assert(isEqual(a, flatten(df.loc(null, ["a"]).values)), "The values in column 'a' are not the same as the values used to create it!")
  assert(isEqual(b, flatten(df.loc(null, ["b"]).values)), "The values in column 'b' are not the same as the values used to create it!")
  assert(isEqual(c, flatten(df.loc(null, ["c"]).values)), "The values in column 'c' are not the same as the values used to create it!")
  assert(isEqual(df.values, df.transpose().transpose().values), "A doubly-transposed DataFrame should have the same values as the original!")
  assert(chop(distance(df.values, zeros(df.shape)) - distance(df.transpose().values, zeros(df.transpose().shape))) === 0, "A transposed DataFrame's values should have the same 2-norm as the original!")
  // assert(isSeries(df.getSubsetByNames(null, ["a"])), "A one-dimensional result should be a Series, not a DataFrame!")
  assert(isDataFrame(df.getSubsetByNames(null, ["b", "c"])), "A two-dimensional result should be a DataFrame, not a Series!")

  let e = new Series(normal(100))
  e.name = "e"
  df = df.assign(e)
  assert(isEqual(e.values, flatten(df.loc(null, ["e"]).values)), "The values in column 'e' are not the same as the values used to create it!")

  let hasFailed = false

  try {
    df.loc(df.index, df.columns)
    hasFailed = false
  } catch(e) {
    hasFailed = true
  }

  assert(!hasFailed, "`df.loc(df.index, df.columns)` should not have failed!")

  try {
    df.loc([], df.columns)
    hasFailed = false
  } catch(e) {
    hasFailed = true
  }

  assert(hasFailed, "`df.loc([], df.columns)` should have failed!")

  try {
    df.loc(df.index, [])
    hasFailed = false
  } catch(e) {
    hasFailed = true
  }

  assert(hasFailed, "`df.loc(df.index, [])` should have failed!")

  try {
    df.loc(["this doesn't exist"], ["this doesn't exist"])
    hasFailed = false
  } catch(e) {
    hasFailed = true
  }

  assert(hasFailed, "`df.loc([\"this doesn't exist\"], [\"this doesn't exist\"])` should have failed!")

  try {
    df.iloc(range(0, dfShape[0]), range(0, dfShape[1]))
    hasFailed = false
  } catch(e) {
    hasFailed = true
  }

  assert(!hasFailed, "`df.iloc(range(0, dfShape[0]), range(0, dfShape[1]))` should not have failed!")

  try {
    df.iloc()
    hasFailed = false
  } catch(e) {
    hasFailed = true
  }

  assert(!hasFailed, "`df.iloc()` should not have failed!")

  try {
    df.iloc([-5], [-7])
    hasFailed = false
  } catch(e) {
    hasFailed = true
  }

  assert(hasFailed, "`df.iloc([-5], [-7])` should have failed!")

  try {
    df.iloc([500], [700])
    hasFailed = false
  } catch(e) {
    hasFailed = true
  }

  assert(hasFailed, "`df.iloc([500], [700])` should have failed!")

  let df2 = df.copy()
  assert(isEqual(df, df2), "A DataFrame and its copy should evaluate as equal!")
  assert(!(df === df2), "A DataFrame and its copy should not be the same object!")

  df.index = range(0, dfShape[0]).map(i => Math.random().toString())
  assert(!isEqual(df.index, df2.index), "`df` should now have random row names!")

  df = df.resetIndex()
  assert(isEqual(df.index, df2.index), "`df` should now have its original row names!")

  let d = normal(100)
  df = df.assign({d})
  assert(isEqual(d, flatten(df.loc(null, ["d"]).values)), "The values in column 'd' are not the same as the values used to create it!")

  a = random(100)
  df = df.assign({a})
  assert(isEqual(a, flatten(df.loc(null, ["a"]).values)), "The values in column 'a' are not the same as the values that were assigned to it!")

  df = new DataFrame(zeros([3, 3]))

  df = df.apply((colVals, colName) => {
    return colVals.map((v, j) => {
      return colName + "/" + j
    })
  })

  let newValuesShouldBe = [
    ["col0/0", "col1/0", "col2/0"],
    ["col0/1", "col1/1", "col2/1"],
    ["col0/2", "col1/2", "col2/2"],
  ]

  assert(isEqual(newValuesShouldBe, df.values), "The DataFrame's new values should be as I've described!")

  df = new DataFrame(zeros([3, 3]))

  df = df.apply((rowVals, rowName) => {
    return rowVals.map((v, i) => {
      return rowName + "/" + i
    })
  }, 1)

  newValuesShouldBe = [
    ["row0/0", "row0/1", "row0/2"],
    ["row1/0", "row1/1", "row1/2"],
    ["row2/0", "row2/1", "row2/2"],
  ]

  assert(isEqual(newValuesShouldBe, df.values), "The DataFrame's new values should be as I've described!")

  df = new DataFrame([
    [0, null],
    [1, "foo"],
    [2, "bar"],
    [3, null],
    [4, null],
    [null, "uh-oh"],
  ])

  assert(isEqual(df.dropMissing().shape, [2, 2]), "The DataFrame should have a shape of [2, 2] after dropping missing values!")
  assert(isEqual(df.dropMissing().index, ["row1", "row2"]), "The DataFrame's new index should be as I've described!")
  assert(df.dropMissing(1).isEmpty(), "The DataFrame should be empty after dropping missing values!")
  assert(isEqual(df.dropMissing(1, "all").shape, df.shape), "The DataFrame should have its original shape after trying to drop missing values!")
  assert(isEqual(df.dropMissing(1, null, 4).shape, df.shape), "The DataFrame should have its original shape after trying to drop missing values!")
  assert(isEqual(df.dropMissing(1, null, 3).shape, [6, 1]), "The DataFrame should have a shape of [6, 1] after dropping missing values!")
  assert(df.dropMissing(1, null, 1).isEmpty(), "The DataFrame should be empty after dropping missing values!")

  x = new DataFrame(
    [[ 5,  6,  4,  1,  6,  7,  2,  8,  6,  1],
     [ 3,  8,  9,  6, 10,  1,  8,  5,  9,  6],
     [ 5,  7,  3,  4,  1,  2,  8,  4,  6,  4],
     [ 6,  8,  2,  4,  4,  8,  2,  8,  7,  4],
     [ 3,  3,  7,  5,  1,  8,  9,  2,  6,  8],
     [ 1,  5,  7,  7,  7,  1,  0,  9,  8,  5],
     [10,  8,  0,  4,  4,  8,  4,  2,  5,  3],
     [ 9,  2,  6,  0, 10,  6,  3,  5, 10,  8],
     [ 4,  9,  1,  4,  9,  4,  8,  9,  6,  7],
     [ 3,  3,  1,  2,  5,  5,  8,  5,  3,  2]]
  )

  let sortedXValues =
    [[ 3,  8,  9,  6, 10,  1,  8,  5,  9,  6],
     [ 9,  2,  6,  0, 10,  6,  3,  5, 10,  8],
     [ 4,  9,  1,  4,  9,  4,  8,  9,  6,  7],
     [ 1,  5,  7,  7,  7,  1,  0,  9,  8,  5],
     [ 5,  6,  4,  1,  6,  7,  2,  8,  6,  1],
     [ 3,  3,  1,  2,  5,  5,  8,  5,  3,  2],
     [ 6,  8,  2,  4,  4,  8,  2,  8,  7,  4],
     [10,  8,  0,  4,  4,  8,  4,  2,  5,  3],
     [ 5,  7,  3,  4,  1,  2,  8,  4,  6,  4],
     [ 3,  3,  7,  5,  1,  8,  9,  2,  6,  8]]

  let sortedX = x.sort(["col4", "col5", "col1"], [false, true, false])

  assert(isEqual(sortedX.values, sortedXValues), "The `sort` method didn't work as expected!")
  assert(isEqual(sortedX.index, ['row1', 'row7', 'row8', 'row5', 'row0', 'row9', 'row3', 'row6', 'row2',
       'row4']), "The indices of the sorted DataFrame are not correct!")
  assert(isEqual(sortedX.columns, ['col0', 'col1', 'col2', 'col3', 'col4', 'col5', 'col6', 'col7', 'col8',
       'col9']), "The columns of the sorted DataFrame are not correct!")

  console.log("All tests passed!")
}

}).call(this)}).call(this,require('_process'))
},{"../../misc/apply.js":76,"../../misc/assert.js":78,"../../misc/print.js":82,"../chop.js":17,"../copy.js":23,"../distance.js":28,"../flatten.js":31,"../is-array.js":35,"../is-boolean.js":36,"../is-equal.js":37,"../is-function.js":38,"../is-number.js":39,"../is-string.js":40,"../is-undefined.js":41,"../max.js":45,"../min.js":48,"../ndarray.js":50,"../normal.js":51,"../random.js":54,"../range.js":55,"../set.js":60,"../shape.js":61,"../sort.js":66,"../transpose.js":71,"../zeros.js":74,"./series.js":21,"_process":86,"fs":84,"path":85}],21:[function(require,module,exports){
let assert = require("../../misc/assert.js")
let isArray = require("../is-array.js")
let isUndefined = require("../is-undefined.js")
let shape = require("../shape.js")
let transpose = require("../transpose.js")
let range = require("../range.js")
let isNumber = require("../is-number.js")
let isString = require("../is-string.js")
let apply = require("../../misc/apply.js")
let isFunction = require("../is-function.js")
let ndarray = require("../ndarray.js")
let copy = require("../copy.js")
let set = require("../set.js")
let reverse = require("../reverse.js")
let sort = require("../sort.js")

function isInteger(x){
  return isNumber(x) && parseInt(x) === x
}

function isWholeNumber(x){
  return isInteger(x) && x >= 0
}

function isObject(x){
  return x instanceof Object && !isArray(x)
}

function isDataFrame(x){
  return x instanceof DataFrame
}

function isSeries(x){
  return x instanceof Series
}

function leftPad(x, maxLength){
  assert(isNumber(x), "The `leftPad` function only works on numbers!")
  let out = x.toString()
  while (out.length < maxLength) out = "0" + out
  return out
}

class Series {
  constructor(data){
    let self = this
    self.name = "data"

    Object.defineProperty(self, "_values", {
      value: [],
      configurable: true,
      enumerable: false,
      writable: true,
    })

    Object.defineProperty(self, "values", {
      configurable: true,
      enumerable: true,

      get(){
        return self._values
      },

      set(x){
        assert(isArray(x), "The new values must be a 1-dimensional array!")

        let dataShape = shape(x)
        assert(dataShape.length === 1, "The new array of values must be 1-dimensional!")

        if (dataShape[0] < self._index.length){
          self._index = self._index.slice(0, dataShape[0])
        } else if (dataShape[0] > self._index.length){
          self._index = self._index.concat(range(self._index.length, dataShape[0]).map(i => "row" + leftPad(i, (x.length - 1).toString().length)))
        }

        self._values = x
      },
    })

    Object.defineProperty(self, "_index", {
      value: [],
      configurable: true,
      enumerable: false,
      writable: true,
    })

    Object.defineProperty(self, "index", {
      configurable: true,
      enumerable: true,

      get(){
        return self._index
      },

      set(x){
        assert(isArray(x), "The new index must be a 1-dimensional array of strings!")
        assert(x.length === self.shape[0], "The new index must be the same length as the old index!")
        assert(shape(x).length === 1, "The new index must be a 1-dimensional array of strings!")

        x.forEach(value => {
          assert(isString(value), "All of the row names must be strings!")
        })

        self._index = x
      },
    })

    if (data){
      let dataShape = shape(data)
      assert(dataShape.length === 1, "The `data` array passed into the constructor of a DataFrame must be 1-dimensional!")
      self.values = data
    }
  }

  get shape(){
    let self = this
    return shape(self.values)
  }

  isEmpty(){
    let self = this
    return set(self.values).filter(v => !isUndefined(v)).length === 0
  }

  clear(){
    let self = this
    let out = self.copy()
    out.values = ndarray(out.shape)
    out.index = self.index
    return out
  }

  get(indices){
    let self = this

    if (isString(indices) || isNumber(indices)) indices = [indices]

    let types = set((indices || []).map(v => typeof v))
    assert(types.length <= 2, "Only whole numbers and/or strings are allowed in `get` arrays!")

    if (types.length === 1){
      assert(types[0] === "string" || types[0] === "number", "Only whole numbers and/or strings are allowed in `get` arrays!")
    }

    if (types.length === 2){
      console.log(types)
      assert(types.indexOf("string") > -1, "Only whole numbers and/or strings are allowed in `get` arrays!")
      assert(types.indexOf("number") > -1, "Only whole numbers and/or strings are allowed in `get` arrays!")
    }

    if (!isUndefined(indices)){
      indices = indices.map(i => {
        if (typeof i === "string"){
          assert(self.index.indexOf(i) > -1, `Index "${i}" does not exist!`)
          return i
        }

        if (typeof i === "number"){
          assert(i >= 0, `Index ${i} is out of bounds!`)
          assert(parseInt(i) === i, `Indices must be integers!`)
          assert(i < self.index.length, `Index ${i} is out of bounds!`)
          return self.index[i]
        }
      })
    }

    return self.getSubsetByNames(indices)
  }

  getSubsetByNames(indices){
    let self = this

    if (isUndefined(indices)) indices = self.index

    assert(isArray(indices), "The `indices` array must be a 1-dimensional array of strings.")
    assert(shape(indices).length === 1, "The `indices` array must be a 1-dimensional array of strings.")
    assert(indices.length > 0, "The `indices` array must contain at least one index name.")

    indices.forEach(name => {
      assert(isString(name), "The `indices` array must contain only strings.")
      assert(self.index.indexOf(name) > -1, `The name "${name}" does not exist in the index.`)
    })

    let values = indices.map(name => {
      return self.values[self.index.indexOf(name)]
    })

    let out = new Series(values)
    out.index = indices
    out.name = self.name
    return out
  }

  getSubsetByIndices(indices){
    let self = this
    let dataShape = self.shape

    if (isUndefined(indices)) indices = range(0, dataShape[0])

    assert(isArray(indices), "The `indices` array must be 1-dimensional array of whole numbers.")
    assert(shape(indices).length === 1, "The `indices` array must be a 1-dimensional array of whole numbers.")
    assert(indices.length > 0, "The `indices` array must contain at least one index.")

    indices.forEach(index => {
      assert(isWholeNumber(index), "The `indices` array must be a 1-dimensional array of whole numbers.")
      assert(index < self.index.length, `The row index ${index} is out of bounds.`)
    })

    let rows = indices.map(i => self.index[i])
    return self.getSubsetByNames(rows)
  }

  loc(indices){
    let self = this
    return self.getSubsetByNames(indices)
  }

  iloc(indices){
    let self = this
    return self.getSubsetByIndices(indices)
  }

  reverse(){
    let self = this
    let out = new Series(reverse(self.values))
    out.index = reverse(self.index)
    out.name = self.name
    return out
  }

  resetIndex(){
    let self = this
    let out = self.copy()
    out.index = range(0, self.shape[0]).map(i => "row" + leftPad(i, (out.index.length - 1).toString().length))
    return out
  }

  copy(){
    let self = this
    let out = new Series(copy(self.values))
    out.index = self.index.slice()
    out.name = self.name
    return out
  }

  apply(fn){
    assert(isFunction(fn), "The parameter to the `apply` method must be a function.")

    let self = this
    let out = self.copy()
    out.values = out.values.map((v, i) => fn(out.index[i], v))
    return out
  }

  dropMissing(condition, threshold){
    let self = this
    let out = self.copy()
    let outIndex = []

    out.values = out.values.filter((v, i) => {
      if (isUndefined(v)){
        return false
      } else {
        outIndex.push(out.index[i])
        return true
      }
    })

    out.index = outIndex
    return out
  }

  toObject(){
    let self = this
    let out = {}
    out[self.name] = {}

    self.index.forEach((index, i) => {
      out[self.name][index] = self.values[i]
    })

    return out
  }

  print(){
    let self = this
    let temp = self.copy()
    let maxRows = typeof window === "undefined" ? 20 : 10

    if (temp.index.length > maxRows){
      temp = temp.get(range(0, maxRows / 2).concat(range(temp.index.length - maxRows / 2, temp.index.length)))
      let tempIndex = copy(temp.index)
      tempIndex.splice(parseInt(tempIndex.length / 2), 0, "...")
      temp.values.push("...")
      temp.index.push("...")
      temp = temp.get(tempIndex)
    }

    let out = {}

    temp.values.forEach((value, i) => {
      let obj = {}
      obj[temp.name] = value
      out[temp.index[i]] = obj
    })

    console.table(out)
    return self
  }

  sort(direction){
    assert(isBoolean(direction) || isString(direction) || isUndefined(direction), "The `sort` method can take an optional parameter that's either a string representing a direction ('ascending' or 'descending') or a boolean representing whether or not the direction is ascending (true or false).")

    let isAscending = true

    if (isUndefined(direction)){
      isAscending = true
    }

    if (isString(direction)){
      direction = direction.trim().toLowerCase()

      assert(direction === "ascending" || direction === "descending", "The `sort` method can take an optional parameter that's either a string representing a direction ('ascending' or 'descending') or a boolean representing whether or not the direction is ascending (true or false).")

      isAscending = direction === "ascending"
    }

    if (isBoolean(direction)){
      isAscending = direction
    }

    let self = this
    let temp = transpose([self.values, self.index])

    temp = transpose(sort(temp, (a, b) => {
      if (a[0] === b[0]) return 0
      if (a[0] < b[0]) return (isAscending ? -1 : 1)
      if (a[0] > b[0]) return (isAscending ? 1 : -1)
    }))

    let out = new Series(temp[0])
    out.index = temp[1]
    out.name = self.name
    return out
  }

  sortByIndex(){
    let self = this
    let temp = transpose([self.values, self.index])

    temp = transpose(sort(temp, (a, b) => {
      if (a[1] === b[1]) return 0
      if (a[1] < b[1]) return -1
      if (a[1] > b[1]) return 1
    }))

    let out = new Series(temp[0])
    out.index = temp[1]
    out.name = self.name
    return out
  }

  filter(fn){
    let self = this
    let out = self.copy()
    let index = copy(out.index)
    let indicesToRemove = []

    let newValues = out.values.filter((value, i) => {
      let shouldKeep = fn(value, i, out.values)
      if (!shouldKeep) indicesToRemove.push(out.index[i])
      return shouldKeep
    })

    indicesToRemove.forEach(i => {
      index.splice(index.indexOf(i), 1)
    })

    if (newValues.length === 0){
      out = new Series()
      out.name = self.name
      return out
    }

    out.values = newValues
    out.index = index
    return out
  }
}

module.exports = Series

// tests
if (!module.parent && typeof(window) === "undefined"){
  let isEqual = require("../is-equal.js")
  let normal = require("../normal.js")
  let set = require("../set.js")
  let distance = require("../distance.js")
  let zeros = require("../zeros.js")
  let chop = require("../chop.js")
  let random = require("../random.js")

  let x = normal(100)
  let series = new Series(x)
  let seriesShape = series.shape

  assert(isSeries(series), "`series` is not a Series!")
  assert(isEqual(series.shape, [100]), "The shape of the Series is not the same as the shape of its data!")
  assert(!series.isEmpty(), "`series` should not be empty!")
  assert((new Series()).isEmpty(), "New Series should be empty!")

  let clearedValues = set(series.clear().values)
  assert(clearedValues.length === 1 && isUndefined(clearedValues[0]), "Cleared Series should only have `undefined` values.")

  assert(isEqual(series.values, series.reverse().reverse().values), "A doubly-reversed series should have the same values as the original!")

  let hasFailed = false

  try {
    series.loc(series.index)
    hasFailed = false
  } catch(e) {
    hasFailed = true
  }

  assert(!hasFailed, "`series.loc(series.index)` should not have failed!")

  try {
    series.loc([])
    hasFailed = false
  } catch(e) {
    hasFailed = true
  }

  assert(hasFailed, "`series.loc([])` should have failed!")

  try {
    series.loc(["this doesn't exist"])
    hasFailed = false
  } catch(e) {
    hasFailed = true
  }

  assert(hasFailed, "`series.loc([\"this doesn't exist\"])` should have failed!")

  try {
    series.iloc(range(0, seriesShape[0]))
    hasFailed = false
  } catch(e) {
    hasFailed = true
  }

  assert(!hasFailed, "`series.iloc(range(0, seriesShape[0]))` should not have failed!")

  try {
    series.iloc()
    hasFailed = false
  } catch(e) {
    hasFailed = true
  }

  assert(!hasFailed, "`series.iloc()` should not have failed!")

  try {
    series.iloc([-5])
    hasFailed = false
  } catch(e) {
    hasFailed = true
  }

  assert(hasFailed, "`series.iloc([-5])` should have failed!")

  try {
    series.iloc([500])
    hasFailed = false
  } catch(e) {
    hasFailed = true
  }

  assert(hasFailed, "`series.iloc([500])` should have failed!")

  let series2 = series.copy()
  assert(isEqual(series, series2), "A Series and its copy should evaluate as equal!")
  assert(!(series === series2), "A Series and its copy should not be the same object!")

  series.index = range(0, seriesShape[0]).map(i => Math.random().toString())
  assert(!isEqual(series.index, series2.index), "`series` should now have random row names!")

  series = series.resetIndex()
  assert(isEqual(series.index, series2.index), "`series` should now have its original row names!")

  series = new Series([0, 1, 2, 3, 4])

  series = series.apply((name, value) => {
    return name + "/" + value
  })

  assert(isEqual(series.values, ["row0/0", "row1/1", "row2/2", "row3/3", "row4/4"]), "The Series' values should be as I described!")

  series = new Series(range(0, 10))
  series.values[0] = null
  series.values[7] = null

  assert(isEqual(series.dropMissing().shape, [8]), "The Series should have a shape of [8] after dropping missing values!")
  assert(isEqual(series.dropMissing().index, ["row1", "row2", "row3", "row4", "row5", "row6", "row8", "row9"]), "The Series' new index should be as I've described!")
  assert(series.clear().dropMissing().isEmpty(), "The Series should be empty after dropping missing values!")

  console.log("All tests passed!")
}

},{"../../misc/apply.js":76,"../../misc/assert.js":78,"../chop.js":17,"../copy.js":23,"../distance.js":28,"../is-array.js":35,"../is-equal.js":37,"../is-function.js":38,"../is-number.js":39,"../is-string.js":40,"../is-undefined.js":41,"../ndarray.js":50,"../normal.js":51,"../random.js":54,"../range.js":55,"../reverse.js":56,"../set.js":60,"../shape.js":61,"../sort.js":66,"../transpose.js":71,"../zeros.js":74}],22:[function(require,module,exports){
let mean = require("./mean.js")
let sqrt = require("./sqrt.js")
let variance = require("./variance.js")

function cohensd(arr1, arr2){
  let m1 = mean(arr1)
  let m2 = mean(arr2)
  let s = sqrt((variance(arr1) + variance(arr2)) / 2)
  return (m1 - m2) / s
}

module.exports = cohensd

},{"./mean.js":46,"./sqrt.js":67,"./variance.js":72}],23:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isArray = require("./is-array.js")

function copy(x){
  if (typeof(x) === "object"){
    if (isUndefined(x)){
      return x
    } else if (isArray(x)){
      return x.map(copy)
    } else {
      let out = {}

      Object.keys(x).forEach(function(key){
        out[key] = copy(x[key])
      })

      return out
    }
  } else {
    return x
  }
}

module.exports = copy

// tests
if (!module.parent && typeof(window) === "undefined"){
  let normal = require("./normal.js")
  let isEqual = require("./is-equal.js")
  let isTheSameObject = (a, b) => a === b
  let isACopy = (a, b) => isEqual(a, b) && (typeof(a) === "object" && !isUndefined(a) && !isUndefined(b) ? !isTheSameObject(a, b) : true)

  assert(isACopy(234, copy(234)), `copy(234) failed!`)
  assert(isACopy(true, copy(true)), `copy(true) failed!`)
  assert(isACopy("foo", copy("foo")), `copy("foo") failed!`)
  assert(isACopy([2, 3, 4], copy([2, 3, 4])), `copy([2, 3, 4]) failed!`)
  assert(isACopy(undefined, copy(undefined)), `copy(undefined) failed!`)

  let x = normal([10, 10, 10])
  assert(isACopy(x, copy(x)), `copy(normal([10, 10, 10])) failed!`)

  x = {foo: normal([5, 5, 5, 5]), name: "Josh", position: {x: 234.5, y: 567.8, z: -890.1}}
  assert(isACopy(x, copy(x)), `copy(obj) failed!`)

  x = () => {}
  assert(isACopy(x, copy(x)), `copy(fn) failed!`)

  x = null
  assert(isACopy(x, copy(x)), `copy(null) failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./is-array.js":35,"./is-equal.js":37,"./is-undefined.js":41,"./normal.js":51}],24:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isArray = require("./is-array.js")
let isNumber = require("./is-number.js")
let isUndefined = require("./is-undefined.js")
let covariance = require("./covariance.js")
let std = require("./std.js")

function correl(x, y){
  assert(!isUndefined(x) && !isUndefined(y), "You must pass two equally-sized one-dimensional arrays into the `correl` function!")
  assert(isArray(x) && isArray(y), "The `correl` function works on exactly two one-dimensional arrays!")
  assert(x.length === y.length, "The two one-dimensional arrays passed into the `correl` function must have the same length!")

  x.concat(y).forEach(function(value){
    assert(isNumber(value), "The two one-dimensional arrays passed into the `correl` function must contain only numbers!")
  })

  return covariance(x, y) / (std(x) * std(y))
}

module.exports = correl

// tests
if (!module.parent && typeof(window) === "undefined"){
  let normal = require("./normal.js")
  let abs = require("./abs.js")
  let add = require("./add.js")
  let scale = require("./scale.js")

  let x = normal([10000])
  let y = normal([10000])
  let r = correl(x, y)

  assert(abs(r) < 0.05, `correl(normal([10000]), normal([10000])) should be approximately 0, but instead was ${r}!`)

  y = add(x, scale(0.01, normal([10000])))
  r = correl(x, y)
  assert(r > 0.95, `correl(x, x + 0.01 * normal([10000])) should be approximately 1, but instead was ${r}!`)

  y = add(scale(-1, x), scale(0.01, normal([10000])))
  r = correl(x, y)
  assert(r < -0.95, `correl(x, -x + 0.01 * normal([10000])) should be approximately -1, but instead was ${r}!`)

  let hasFailed

  try {
    hasFailed = false
    correl(1, 2)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `correl(1, 2) should have failed!`)

  try {
    hasFailed = false
    correl(true, false)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `correl(true, false) should have failed!`)

  try {
    hasFailed = false
    correl([], {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `correl([], {}) should have failed!`)

  try {
    hasFailed = false
    correl("foo", "bar")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `correl("foo", "bar") should have failed!`)

  try {
    hasFailed = false
    correl([2, 3, 4], ["a", "b", "c"])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `correl([2, 3, 4], ["a", "b", "c"]) should have failed!`)

  try {
    hasFailed = false
    correl([[2, 3, 4], [5, 6, 7]], [[8, 9, 10], [11, 12, 13]])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `correl([[2, 3, 4], [5, 6, 7]], [[8, 9, 10], [11, 12, 13]]) should have failed!`)

  let fn = () => {}

  try {
    hasFailed = false
    correl(fn, fn)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `correl(fn, fn) should have failed!`)

  try {
    let foo
    hasFailed = false
    correl(foo, foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `correl(foo, foo) should have failed!`)

  assert(isNaN(correl([2, 3, 4], [1, 1, 1])), `correl([2, 3, 4], [1, 1, 1]) should be NaN!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./abs.js":10,"./add.js":11,"./covariance.js":27,"./is-array.js":35,"./is-number.js":39,"./is-undefined.js":41,"./normal.js":51,"./scale.js":58,"./std.js":68}],25:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isNumber = require("./is-number.js")
let isUndefined = require("./is-undefined.js")
let vectorize = require("./vectorize.js")

let cos = vectorize(function(x){
  assert(!isUndefined(x), "You must pass a single number or single array of numbers into the `cos` function!")
  assert(isNumber(x), "The `cos` function only works on numbers!")
  return Math.cos(x)
})

module.exports = cos

// tests
if (!module.parent && typeof(window) === "undefined"){
  let min = require("./min.js")
  let max = require("./max.js")
  let normal = require("./normal.js")
  let chop = require("./chop.js")

  let x = normal([10000]).map(v => v * 100)
  let y = cos(x)

  assert(min(y) >= -1, "Values produced by the `cos` function should never be below -1!")
  assert(max(y) <= 1, "Values produced by the `cos` function should never be above 1!")

  x = 0
  y = cos(x)
  assert(y === 1, `cos(0) should be 1, but instead is ${y}!`)

  x = Math.PI / 2
  y = cos(x)
  assert(chop(y) === 0, `cos(Math.PI / 2) should be 0, but instead is ${y}!`)

  x = Math.PI
  y = cos(x)
  assert(y === -1, `cos(Math.PI) should be -1, but instead is ${y}!`)

  x = 3 * Math.PI / 2
  y = cos(x)
  assert(chop(y) === 0, `cos(3 * Math.PI / 2) should be 0, but instead is ${y}!`)

  let hasFailed

  try {
    hasFailed = false
    cos("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `cos("foo") should have failed!`)

  try {
    hasFailed = false
    cos(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `cos(true) should have failed!`)

  try {
    hasFailed = false
    cos({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `cos({}) should have failed!`)

  try {
    hasFailed = false
    cos([1, 2, "three"])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `cos([1, 2, "three"]) should have failed!`)

  try {
    hasFailed = false
    cos(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `cos(() => {}) should have failed!`)

  try {
    let foo
    hasFailed = false
    cos(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `cos(foo) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./chop.js":17,"./is-number.js":39,"./is-undefined.js":41,"./max.js":45,"./min.js":48,"./normal.js":51,"./vectorize.js":73}],26:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isArray = require("./is-array.js")
let flatten = require("./flatten.js")

function count(arr, items){
  assert(!isUndefined(arr), "You must an array and an item to count to the `count` function!")
  assert(isArray(arr), "You must an array and an item to count to the `count` function!")

  // NOTE: This currently flattens the array that's passed in, which means that it's not possible to count occurrences of arrays within arrays! I'm not sure whether this is desirable behavior or not, so I'm just making a note of it for now. It's not trivial to count occurrences of identical objects, so maybe this function should refuse to operate on objects!
  let temp = flatten(arr)

  if (isArray(items)){
    return flatten(items).map(function(item1){
      return temp.filter(item2 => item2 === item1).length
    })
  } else {
    return temp.filter(other => other === items).length
  }
}

module.exports = count

// tests
if (!module.parent && typeof(window) === "undefined"){
  let random = require("./random.js")
  let round = require("./round.js")
  let abs = require("./abs.js")

  let x = [2, 2, 2, 3, 4, 2, 2]
  let yTrue = 5
  let yPred = count(x, 2)
  assert(yTrue === yPred)

  x = [true, true, false, false, false, "a", "a", "a", "a", "a"]
  yTrue = [2, 3, 5]
  yPred = count(x, [true, false, "a"])
  for (let i=0; i<yTrue.length; i++) assert(yTrue[i] === yPred[i], `count([true, true, false, false, false, "a", "a", "a", "a", "a"], [true, false, "a"]) should be [2, 3, 5]!`)

  x = round(random([10000]))
  let y1 = count(x, 0)
  let y2 = count(x, 1)
  assert(abs(y1 - 5000) < 0.05 * 5000, `count(round(random([10000])), 0) should be approximately 5000!`)
  assert(abs(y2 - 5000) < 0.05 * 5000, `count(round(random([10000])), 1) should be approximately 5000!`)

  assert(count([2, 3, 4]) === 0, `count([2, 3, 4]) should be 0!`)

  let hasFailed

  try {
    hasFailed = false
    count()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `count() should have failed!`)

  try {
    hasFailed = false
    count(234)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `count(234) should have failed!`)

  try {
    hasFailed = false
    count(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `count(true) should have failed!`)

  try {
    hasFailed = false
    count("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `count("foo") should have failed!`)

  try {
    hasFailed = false
    count({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `count({}) should have failed!`)

  try {
    hasFailed = false
    count(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `count(() => {}) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./abs.js":10,"./flatten.js":31,"./is-array.js":35,"./is-undefined.js":41,"./random.js":54,"./round.js":57}],27:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isArray = require("./is-array.js")
let isUndefined = require("./is-undefined.js")
let isNumber = require("./is-number.js")
let mean = require("./mean.js")

function covariance(x, y){
  assert(!isUndefined(x) && !isUndefined(y), "You must pass two equally-sized one-dimensional arrays into the `covariance` function!")

  assert(isArray(x) && isArray(y), "The `covariance` function only works on two equally-sized one-dimensional arrays of numbers!")

  x.concat(y).forEach(function(v){
    assert(isNumber(v), "The `covariance` function only works on two equally-sized one-dimensional arrays of numbers!")
  })

  assert(x.length === y.length, "The two one-dimensional arrays passed into the `covariance` function must be of equal length!")

  let mx = mean(x)
  let my = mean(y)
  let out = 0
  for (let i=0; i<x.length; i++) out += (x[i] - mx) * (y[i] - my)
  return out / x.length
}

module.exports = covariance

// tests
if (!module.parent && typeof(window) === "undefined"){
  let normal = require("./normal.js")
  let abs = require("./abs.js")
  let chop = require("./chop.js")

  let x = [2, 3, 4]
  let y = [1, 1, 1]
  let cv = covariance(x, y)
  assert(cv === 0, `covariance([2, 3, 4], [1, 1, 1]) should be 0, but instead was ${cv}!`)

  x = normal([10000])
  y = normal([10000])
  cv = covariance(x, y)
  assert(abs(cv) < 0.05, `covariance(normal([10000]), normal(10000)) should be approximately 0, but instead is ${cv}!`)

  y = covariance(x, x)
  assert(y > 0.95, `covariance(x, x) should be approximately 1, but instead is ${y}!`)

  assert(isNaN(covariance([], [])), `covariance([], []) should be NaN!`)

  let hasFailed

  try {
    hasFailed = false
    covariance([1, 2, 3], [1, 2, 3, 4])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `covariance([1, 2, 3], [1, 2, 3, 4]) should have failed!`)

  try {
    hasFailed = false
    covariance(["foo", "bar", "baz"], ["a", "b", "c"])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `covariance(["foo", "bar", "baz"], ["a", "b", "c"]) should have failed!`)

  try {
    let foo
    hasFailed = false
    covariance([foo], [foo])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `covariance([foo], [foo]) should have failed!`)

  try {
    let fn = () => {}
    hasFailed = false
    covariance([fn], [fn])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `covariance([fn], [fn]) should have failed!`)

  try {
    hasFailed = false
    covariance({}, {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `covariance({}, {}) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./abs.js":10,"./chop.js":17,"./is-array.js":35,"./is-number.js":39,"./is-undefined.js":41,"./mean.js":46,"./normal.js":51}],28:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isNumber = require("./is-number.js")
let shape = require("./shape.js")
let flatten = require("./flatten.js")
let pow = require("./pow.js")
let sum = require("./sum.js")
let add = require("./add.js")
let scale = require("./scale.js")

function distance(a, b){
  assert(!isUndefined(a) && !isUndefined(b), "You must pass two congruently-shaped arrays of numbers into the `distance` function!")

  let shape1 = shape(a)
  let shape2 = shape(b)

  assert(shape1.length === shape2.length, "You must pass two congruently-shaped arrays of numbers into the `distance` function!")

  assert(sum(add(shape1, scale(shape2, -1))) === 0, "You must pass two congruently-shaped arrays of numbers into the `distance` function!")

  flatten(a).concat(flatten(b)).forEach(function(value){
    assert(isNumber(value), "The `distance` function only works on numbers!")
  })

  return pow(sum(pow(add(a, scale(b, -1)), 2)), 0.5)
}

module.exports = distance

// tests
if (!module.parent && typeof(window) === "undefined"){
  let normal = require("./normal.js")

  let a = [4, 6]
  let b = [1, 2]
  assert(distance(a, b) === 5, `distance([4, 6], [1, 2]) should be 5!`)

  a = [-2, -2]
  b = [-1, -1]
  assert(distance(a, b) === pow(2, 0.5), `distance([-2, -2], [-1, -1]) should be sqrt(2)!`)

  a = normal([5, 5, 5, 5])
  assert(distance(a, a) === 0, `distance(x, x) should be 0!`)

  let hasFailed

  try {
    hasFailed = false
    distance()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `distance() should have failed!`)

  try {
    hasFailed = false
    distance(normal(5), normal(6))
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `distance(normal(5), normal(6)) should have failed!`)

  try {
    hasFailed = false
    distance(true, false)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `distance(true, false) should have failed!`)

  try {
    hasFailed = false
    distance("foo", "bar")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `distance("foo", "bar") should have failed!`)

  try {
    hasFailed = false
    distance({}, {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `distance({}, {}) should have failed!`)

  try {
    let fn = () => {}
    hasFailed = false
    distance(fn, fn,)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `distance(fn, fn) should have failed!`)

  try {
    let foo
    hasFailed = false
    distance(foo, foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `distance(foo, foo) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./add.js":11,"./flatten.js":31,"./is-number.js":39,"./is-undefined.js":41,"./normal.js":51,"./pow.js":53,"./scale.js":58,"./shape.js":61,"./sum.js":69}],29:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isArray = require("./is-array.js")
let isNumber = require("./is-number.js")
let flatten = require("./flatten.js")
let min = require("./min.js")
let max = require("./max.js")
let apply = require("../misc/apply.js")

function distrib(x, bins){
  assert(!isUndefined(x), "You must pass an array of numbers (and optionally an integer number of bins) into the `distrib` function!")
  assert(isArray(x), "You must pass an array of numbers (and optionally an integer number of bins) into the `distrib` function!")

  let temp = flatten(x)
  temp.forEach(val => assert(isNumber(val)), "You must pass an array of numbers (and optionally an integer number of bins) into the `distrib` function!")

  if (isUndefined(bins)){
    bins = parseInt(temp.length / 10)
  } else {
    assert(isNumber(bins), "You must pass an array of numbers (and optionally an integer number of bins) into the `distrib` function!")
    assert(bins === parseInt(bins), "You must pass an array of numbers (and optionally an integer number of bins) into the `distrib` function!")
  }

  let out = []
  let start = min(temp)
  let stop = max(temp)
  let step = (stop - start) / bins

  for (let i=start; i<stop; i+=step){
    let drop = temp.filter(val => (val >= i && val < i + step) || (i + step >= stop && val >= stop))
    let count = drop.length
    drop.forEach(val => temp.splice(temp.indexOf(val), 1))
    out.push(count)
  }

  return out
}

module.exports = distrib

// tests
if (!module.parent && typeof(window) === "undefined"){
  let isEqual = require("./is-equal.js")
  let normal = require("./normal.js")

  let x = [1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 5]
  let bins = 5
  let yTrue = [5, 4, 3, 2, 1]
  let yPred = distrib(x, bins)
  assert(isEqual(yTrue, yPred), `distrib([1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 5], 5) should be [5, 4, 3, 2, 1], but instead was [${yPred.join(", ")}]!`)

  x = [3, 4, 5, 6, 7, 8, 9, 10]
  bins = 8
  yTrue = [1, 1, 1, 1, 1, 1, 1, 1]
  yPred = distrib(x, bins)
  assert(isEqual(yTrue, yPred), `distrib([3, 4, 5, 6, 7, 8, 9, 10], 8) should be [1, 1, 1, 1, 1, 1, 1, 1], but instead was [${yPred.join(", ")}]!`)

  x = [-2.5, -2.5, -1.5, -1.5, -1.5, -1.5, -0.5, 0.5, 0.5, 0.5, 1.5, 1.5, 1.5, 1.5, 1.5, 2.5, 2.5]
  bins = 3
  yTrue = [6, 4, 7]
  yPred = distrib(x, bins)
  assert(isEqual(yTrue, yPred), `distrib([-2.5, -2.5, -1.5, -1.5, -1.5, -1.5, -0.5, 0.5, 0.5, 0.5, 1.5, 1.5, 1.5, 1.5, 1.5, 2.5, 2.5], 3) should be [6, 4, 7], but instead was [${yPred.join(", ")}]!`)

  let hasFailed

  try {
    hasFailed = false
    distrib()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `distrib() should have failed!`)

  try {
    hasFailed = false
    distrib(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `distrib(true) should have failed!`)

  try {
    hasFailed = false
    distrib("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `distrib("foo") should have failed!`)

  try {
    hasFailed = false
    distrib(234)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `distrib(234) should have failed!`)

  try {
    let foo
    hasFailed = false
    distrib(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `distrib(foo) should have failed!`)

  try {
    hasFailed = false
    distrib(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `distrib(() => {}) should have failed!`)

  try {
    hasFailed = false
    distrib({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `distrib({}) should have failed!`)

  try {
    hasFailed = false
    distrib([], "foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `distrib([], "foo") should have failed!`)

  try {
    hasFailed = false
    distrib([], true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `distrib(true) should have failed!`)

  try {
    hasFailed = false
    distrib([], [])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `distrib([]) should have failed!`)

  try {
    hasFailed = false
    distrib([], {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `distrib([], {}) should have failed!`)

  try {
    hasFailed = false
    distrib([], () => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `distrib([], () => {}) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/apply.js":76,"../misc/assert.js":78,"./flatten.js":31,"./is-array.js":35,"./is-equal.js":37,"./is-number.js":39,"./is-undefined.js":41,"./max.js":45,"./min.js":48,"./normal.js":51}],30:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isArray = require("./is-array.js")
let isNumber = require("./is-number.js")
let isEqual = require("./is-equal.js")
let flatten = require("./flatten.js")
let shape = require("./shape.js")
let sum = require("./sum.js")
let scale = require("./scale.js")
let transpose = require("./transpose.js")

function dot(a, b){
  assert(!isUndefined(a) && !isUndefined(b), "You must pass two arrays of numbers into the `dot` function!")
  assert(isArray(a) && isArray(b), "You must pass two arrays of numbers into the `dot` function!")

  flatten(a).concat(flatten(b)).forEach(function(val){
    assert(isNumber(val), "The `dot` function only works on numbers!")
  })

  let aShape = shape(a)
  let bShape = shape(b)

  assert(aShape.length <= 2 && bShape.length <= 2, "I'm not smart enough to know how to get the dot-product of arrays that have more than 2 dimensions. Sorry for the inconvenience! Please only pass 1- or 2-dimensional arrays into the `dot` function!")
  assert(aShape[aShape.length-1] === bShape[0], `There's a dimension misalignment in the two arrays you passed into the \`dot\` function. (${aShape[aShape.length-1]} !== ${bShape[0]})`)

  if (aShape.length === 1 && bShape.length === 1){
    return sum(scale(a, b))
  } else if (aShape.length === 1 && bShape.length === 2){
    return transpose(b).map(col => dot(a, col))
  } else if (aShape.length === 2 && bShape.length === 1){
    return a.map(row => dot(row, b))
  } else if (aShape.length === 2 && bShape.length === 2){
    let bTranspose = transpose(b)
    let out = []

    for (let i=0; i<a.length; i++){
      let row = []

      for (let j=0; j<bTranspose.length; j++){
        row.push(dot(a[i], bTranspose[j]))
      }

      out.push(row)
    }

    return out
  }
}

module.exports = dot

// tests
if (!module.parent && typeof(window) === "undefined"){
  let normal = require("./normal.js")

  let a = [2, 3, 4]
  let b = [5, 6, 7]
  let yTrue = 56
  let yPred = dot(a, b)
  assert(isEqual(yTrue, yPred), `dot([2, 3, 4], [5, 6, 7]) should be 56!`)

  a = [[2, 3], [4, 5], [6, 7]]
  b = [[8, 9, 10], [11, 12, 13]]
  yTrue = [[49, 54, 59], [87, 96, 105], [125, 138, 151]]
  yPred = dot(a, b)
  assert(isEqual(yTrue, yPred), `dot([[2, 3], [4, 5], [6, 7]], [[8, 9, 10], [11, 12, 13]]) should be [[49, 54, 59], [87, 96, 105], [125, 138, 151]]!`)

  a = [4, 3, 2, 1]
  b = [[12, 11], [10, 9], [8, 7], [6, 5]]
  yTrue = [100, 90]
  yPred = dot(a, b)
  assert(isEqual(yTrue, yPred), `dot([4, 3, 2, 1], [[12, 11], [10, 9], [8, 7], [6, 5]]) should be [100, 90]!`)

  a = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]]
  b = [11, 12, 13, 14, 15]
  yTrue = [205, 530]
  yPred = dot(a, b)
  assert(isEqual(yTrue, yPred), `dot([[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]], [11, 12, 13, 14, 15]) should be [100, 90]!`)

  let hasFailed

  try {
    hasFailed = false
    dot()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `dot() should have failed!`)

  try {
    hasFailed = false
    dot(2, 3)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `dot(2, 3) should have failed!`)

  try {
    hasFailed = false
    dot(true, false)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `dot(true, false) should have failed!`)

  try {
    hasFailed = false
    dot("foo", "bar")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `dot("foo", "bar") should have failed!`)

  try {
    hasFailed = false
    dot(normal([2, 3]), normal([2, 3]))
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `dot(normal([2, 3]), normal([2, 3])) should have failed!`)

  try {
    hasFailed = false
    dot(normal([2, 3, 4]))
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `dot([2, 3, 4]) should have failed!`)

  try {
    let fn = () => {}
    hasFailed = false
    dot(fn, fn)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `dot(fn, fn) should have failed!`)

  try {
    let foo
    hasFailed = false
    dot(foo, foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `dot(foo, foo) should have failed!`)

  try {
    hasFailed = false
    dot({}, {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `dot({}, {}) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./flatten.js":31,"./is-array.js":35,"./is-equal.js":37,"./is-number.js":39,"./is-undefined.js":41,"./normal.js":51,"./scale.js":58,"./shape.js":61,"./sum.js":69,"./transpose.js":71}],31:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isArray = require("./is-array.js")

function flatten(arr){
  assert(!isUndefined(arr), "You must pass one array into the `flatten` function!")
  assert(isArray(arr), "The `flatten` function only works on arrays!")

  let out = []

  arr.forEach(function(value){
    if (isArray(value)){
      out = out.concat(flatten(value))
    } else {
      out.push(value)
    }
  })

  return out
}

module.exports = flatten

// tests
if (!module.parent && typeof(window) === "undefined"){
  let normal = require("./normal.js")

  let x = [2, 3, 4]
  let yTrue = [2, 3, 4]
  let yPred = flatten(x)
  for (let i=0; i<yTrue.length; i++) assert(yTrue[i] === yPred[i], `flatten([2, 3, 4]) should be [2, 3, 4]!`)

  x = [[2, 3, 4], [5, 6, 7]]
  yTrue = [2, 3, 4, 5, 6, 7]
  yPred = flatten(x)
  for (let i=0; i<yTrue.length; i++) assert(yTrue[i] === yPred[i], `flatten([[2, 3, 4], [5, 6, 7]]) should be [2, 3, 4, 5, 6, 7]!`)

  x = normal([2, 3, 4, 5])
  yPred = flatten(x)
  assert(yPred.length === 120, `flatten(normal([2, 3, 4, 5])) should have 120 values!`)

  let hasFailed

  try {
    hasFailed = false
    flatten()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `flatten() should have failed!`)

  try {
    hasFailed = false
    flatten({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `flatten({}) should have failed!`)

  try {
    hasFailed = false
    flatten(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `flatten(true) should have failed!`)

  try {
    hasFailed = false
    flatten("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `flatten("foo") should have failed!`)

  try {
    hasFailed = false
    flatten(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `flatten(() => {}) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./is-array.js":35,"./is-undefined.js":41,"./normal.js":51}],32:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isNumber = require("./is-number.js")
let isUndefined = require("./is-undefined.js")
let vectorize = require("./vectorize.js")

let floor = vectorize(function(x){
  assert(!isUndefined(x), "You must pass a single number or a single array of numbers into the `floor` function!")

  assert(isNumber(x), "The `floor` function only works on numbers!")

  return Math.floor(x)
})

module.exports = floor

// tests
if (!module.parent && typeof(window) === "undefined"){
  let random = require("./random.js")
  let zeros = require("./zeros.js")

  let x = 5.95
  let yTrue = 5
  let yPred = floor(x)
  assert(yTrue === yPred, `floor(${x}) should be ${yTrue}, but instead was ${yPred}!`)

  x = -3.25
  yTrue = -4
  yPred = floor(x)
  assert(yTrue === yPred, `floor(${x}) should be ${yTrue}, but instead was ${yPred}!`)

  x = [1.25, 2.5, 3.75]
  yTrue = [1, 2, 3]
  yPred = floor(x)
  for (let i=0; i<yTrue.length; i++) assert(yTrue[i] === yPred[i], `floor(${x[i]}) should be ${yTrue[i]}, but instead was ${yPred[i]}!`)

  x = random([500])
  yTrue = zeros([500])
  yPred = floor(x)
  for (let i=0; i<yTrue.length; i++) assert(yTrue[i] === yPred[i], `floor(${x[i]}) should be ${yTrue[i]}, but instead was ${yPred[i]}!`)

  let hasFailed

  try {
    hasFailed = false
    floor("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `floor("foo") should have failed!`)

  try {
    hasFailed = false
    floor({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `floor({}) should have failed!`)

  try {
    hasFailed = false
    floor([1, 2, "three"])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `floor([1, 2, "three"]) should have failed!`)

  try {
    let foo
    hasFailed = false
    floor(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `floor(foo) should have failed!`)

  try {
    hasFailed = false
    floor(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `floor(() => {}) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./is-number.js":39,"./is-undefined.js":41,"./random.js":54,"./vectorize.js":73,"./zeros.js":74}],33:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isNumber = require("./is-number.js")
let zeros = require("./zeros.js")

function identity(size){
  assert(!isUndefined(size), "You must pass an integer greater than 0 (representing the size) into the `identity` function!")
  assert(isNumber(size), "You must pass an integer greater than 0 (representing the size) into the `identity` function!")
  assert(parseInt(size) === size, "You must pass an integer greater than 0 (representing the size) into the `identity` function!")
  assert(size > 0, "You must pass an integer greater than 0 (representing the size) into the `identity` function!")

  let out = zeros([size, size])
  for (let i=0; i<size; i++) out[i][i] = 1
  return out
}

module.exports = identity

// tests
if (!module.parent && typeof(window) === "undefined"){
  function isIdentity(x){
    for (let i=0; i<x.length; i++){
      let row = x[i]

      for (let j=0; j<row.length; j++){
        if (i === j){
          if (x[i][j] !== 1) return false
        } else {
          if (x[i][j] !== 0) return false
        }
      }
    }

    return true
  }

  let x = identity(100)
  assert(isIdentity(x), `identity(100) is not an identity matrix!`)

  let hasFailed

  try {
    hasFailed = false
    identity()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `identity() should have failed!`)

  try {
    hasFailed = false
    identity("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `identity("foo") should have failed!`)

  try {
    hasFailed = false
    identity(23.4)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `identity(23.4) should have failed!`)

  try {
    hasFailed = false
    identity(-10)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `identity(-10) should have failed!`)

  try {
    hasFailed = false
    identity(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `identity(true) should have failed!`)

  try {
    hasFailed = false
    identity({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `identity({}) should have failed!`)

  try {
    hasFailed = false
    identity(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `identity(() => {}) should have failed!`)

  try {
    let foo
    hasFailed = false
    identity(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `identity(foo) should have failed!`)

  try {
    hasFailed = false
    identity([])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `identity([]) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./is-number.js":39,"./is-undefined.js":41,"./zeros.js":74}],34:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isArray = require("./is-array.js")
let isNumber = require("./is-number.js")
let flatten = require("./flatten.js")
let shape = require("./shape.js")
let slice = require("./slice.js")
let dot = require("./dot.js")
let add = require("./add.js")
let scale = require("./scale.js")
let append = require("./append.js")
let range = require("./range.js")

function inverse(x){
  assert(!isUndefined(x), "You must pass a square 2D array into the `inverse` function!")
  assert(isArray(x), "You must pass a square 2D array into the `inverse` function!")
  flatten(x).forEach(v => assert(isNumber(v), "The array passed into the `inverse` function must contain only numbers!"))

  let xShape = shape(x)
  assert(xShape.length === 2, "The array passed into the `inverse` function must be exactly two-dimensional and square!")
  assert(xShape[0] === xShape[1], "The array passed into the `inverse` function must be exactly two-dimensional and square!")
  assert(xShape[0] >= 0, "The array passed into the `inverse` function must be exactly two-dimensional and square!")

  // https://en.wikipedia.org/wiki/Invertible_matrix#Blockwise_inversion
  if (xShape[0] === 0){
    return x
  } else if (xShape[0] === 1){
    assert(x[0][0] !== 0, "This matrix cannot be inverted!")
    return 1 / x[0][0]
  } else if (xShape[0] === 2){
    let a = x[0][0]
    let b = x[0][1]
    let c = x[1][0]
    let d = x[1][1]

    let det = a * d - b * c
    assert(det !== 0, "This matrix cannot be inverted!")

    let out = [[d, -b], [-c, a]]
    return scale(out, 1 / det)
  } else if (xShape[0] > 1){
    let times = (a, b) => (isNumber(a) || isNumber(b)) ? scale(a, b) : dot(a, b)

    for (let divider=1; divider<xShape[0]-1; divider++){
      try {
        let A = slice(x, [range(0, divider), range(0, divider)])
        let B = slice(x, [range(0, divider), range(divider, xShape[0])])
        let C = slice(x, [range(divider, xShape[0]), range(0, divider)])
        let D = slice(x, [range(divider, xShape[0]), range(divider, xShape[0])])

        let AInv = inverse(A)
        let CompInv = inverse(add(D, times(-1, times(times(C, AInv), B))))

        let topLeft = add(AInv, times(times(times(times(AInv, B), CompInv), C), AInv))
        let topRight = times(-1, times(times(AInv, B), CompInv))
        let bottomLeft = times(-1, times(times(CompInv, C), AInv))
        let bottomRight = CompInv

        let out = append(append(topLeft, topRight, 1), append(bottomLeft, bottomRight, 1), 0)
        return out
      } catch(e){}
    }

    assert(false, "This matrix cannot be inverted!")
  }
}

module.exports = inverse

// tests
if (!module.parent && typeof(window) === "undefined"){
  let identity = require("./identity.js")
  let isEqual = require("./is-equal.js")
  let normal = require("./normal.js")
  let random = require("./random.js")
  let distance = require("./distance.js")
  let round = require("./round.js")
  let zeros = require("./zeros.js")

  let x = normal([10, 10])
  let xinv = inverse(x)
  assert(distance(identity(10), dot(x, xinv)) < 1e-5, `FAIL!`)

  x = random([20, 20])
  xinv = inverse(x)
  assert(distance(identity(20), dot(x, xinv)) < 1e-5, `FAIL!`)

  x = round(add(scale(normal([10, 10]), 10), 20))
  xinv = inverse(x)
  assert(distance(identity(10), dot(x, xinv)) < 1e-5, `FAIL!`)

  x = identity(10)
  xinv = inverse(x)
  assert(distance(identity(10), dot(x, xinv)) < 1e-5, `FAIL!`)

  let hasFailed

  try {
    hasFailed = false
    inverse()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `inverse() should have failed!`)

  try {
    hasFailed = false
    inverse(234)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `inverse(234) should have failed!`)

  try {
    hasFailed = false
    inverse("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `inverse("foo") should have failed!`)

  try {
    hasFailed = false
    inverse(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `inverse(true) should have failed!`)

  try {
    hasFailed = false
    inverse({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `inverse({}) should have failed!`)

  try {
    hasFailed = false
    inverse(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `inverse(() => {}) should have failed!`)

  try {
    let foo
    hasFailed = false
    inverse(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `inverse(foo) should have failed!`)

  try {
    hasFailed = false
    x = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    inverse(x)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `inverse([[1, 2, 3], [4, 5, 6], [7, 8, 9]]) should have failed!`)

  try {
    hasFailed = false
    inverse(zeros([10, 10]))
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `inverse(zeros([10, 10])) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./add.js":11,"./append.js":12,"./distance.js":28,"./dot.js":30,"./flatten.js":31,"./identity.js":33,"./is-array.js":35,"./is-equal.js":37,"./is-number.js":39,"./is-undefined.js":41,"./normal.js":51,"./random.js":54,"./range.js":55,"./round.js":57,"./scale.js":58,"./shape.js":61,"./slice.js":65,"./zeros.js":74}],35:[function(require,module,exports){
function isArray(obj){
  return obj instanceof Array
}

module.exports = isArray

// tests
if (!module.parent && typeof(window) === "undefined"){
  let assert = require("../misc/assert.js")

  assert(isArray([]), `isArray([]) should return true!`)
  assert(isArray([2, 3, 4]), `isArray([2, 3, 4]) should return true!`)
  assert(isArray(new Array()), `isArray(new Array()) should return true!`)
  assert(!isArray({}), `isArray({}) should return false!`)
  assert(!isArray({push: () => {}}), `isArray({push: () => {}}) should return false!`)
  assert(!isArray("foo"), `isArray("foo") should return false!`)
  assert(!isArray(true), `isArray(true) should return false!`)
  assert(!isArray(false), `isArray(false) should return false!`)
  assert(!isArray(() => {}), `isArray(() => {}) should return false!`)
  assert(!isArray(3), `isArray(3) should return false!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78}],36:[function(require,module,exports){
function isBoolean(x){
  return typeof(x) === "boolean"
}

module.exports = isBoolean

},{}],37:[function(require,module,exports){
let isArray = require("./is-array.js")

function isEqual(a, b){
  let aType = typeof(a)
  let bType = typeof(b)
  if (aType !== bType) return false

  if (aType === "undefined") return true
  if (aType === "boolean") return a === b
  if (aType === "number") return a === b
  if (aType === "string") return a === b
  if (aType === "function") return a === b

  if (aType === "object"){
    if (a === null || b === null){
      return a === null && b === null
    } else {
      let aKeys = Object.keys(a)
      let bKeys = Object.keys(b)
      if (aKeys.length !== bKeys.length) return false

      for (let i=0; i<aKeys.length; i++){
        let key = aKeys[i]
        if (!b.hasOwnProperty(key)) return false
        if (!isEqual(a[key], b[key])) return false
      }

      return true
    }
  }
}

module.exports = isEqual

// tests
if (!module.parent && typeof(window) === "undefined"){
  let assert = require("../misc/assert.js")

  assert(isEqual(2, 2), `isEqual(2, 2) should be true!`)
  assert(isEqual(-3.5, -3.5), `isEqual(-3.5, -3.5) should be true!`)
  assert(isEqual("foo", "foo"), `isEqual("foo", "foo") should be true!`)
  assert(isEqual(true, true), `isEqual(true, true) should be true!`)
  assert(isEqual(false, false), `isEqual(false, false) should be true!`)
  assert(isEqual({}, {}), `isEqual({}, {}) should be true!`)
  assert(isEqual(undefined, undefined), `isEqual(undefined, undefined) should be true!`)
  assert(isEqual(null, null), `isEqual(null, null) should be true!`)
  assert(isEqual({x: 5}, {x: 5}), `isEqual({x: 5}, {x: 5}) should be true!`)
  assert(isEqual([2, 3, 4], [2, 3, 4]), `isEqual([2, 3, 4], [2, 3, 4]) should be true!`)

  let fn = () => {}
  assert(isEqual(fn, fn), `isEqual(fn, fn) should be true!`)

  let a = {name: "James", friends: ["Bill", "Sally"]}
  let b = {name: "James", friends: ["Bill", "Sally"]}
  assert(isEqual(a, b), `isEqual(a, b) should be true!`)

  let others = [2, -3.5, "foo", true, false, {}, undefined, null, {x: 5}, [2, 3, 4], {name: "James", friends: ["Bill", "Sally"]}]

  for (let i=0; i<others.length-1; i++){
    for (let j=i; j<others.length; j++){
      if (i !== j){
        a = others[i]
        b = others[j]
        assert(!isEqual(a, b), `isEqual(a, b) should be false! (a: ${JSON.stringify(a)}, b: ${JSON.stringify(b)})`)
      }
    }
  }

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./is-array.js":35}],38:[function(require,module,exports){
function isFunction(fn){
  return typeof(fn) === "function"
}

module.exports = isFunction

},{}],39:[function(require,module,exports){
function isNumber(x){
  return typeof(x) === "number"
}

module.exports = isNumber

// tests
if (!module.parent && typeof(window) === "undefined"){
  let assert = require("../misc/assert.js")

  assert(isNumber(3), `3 is a number!`)
  assert(isNumber(-3.5), `-3.5 is a number!`)
  assert(isNumber(2573.2903482093482035023948, `2573.2903482093482035023948 is a number!`))
  assert(!isNumber("35"), `"35" is not a number!`)
  assert(!isNumber("foo"), `"foo" is not a number!`)
  assert(!isNumber([2, 3, 4]), `[2, 3, 4] is not a number!`)
  assert(!isNumber({x: 5}), "{x: 5} is not a number!")
  assert(!isNumber(true), `true is not a number!`)
  assert(!isNumber(false), `false is not a number!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78}],40:[function(require,module,exports){
function isString(s){
  return typeof(s) === "string"
}

module.exports = isString

// tests
if (!module.parent && typeof(window) === "undefined"){
  let assert = require("../misc/assert.js")

  assert(isString("hi"), `"hi" is a string!`)
  assert(isString(""), `"" is a string!`)
  assert(isString(``), `\`\` is a string!`)
  assert(isString('foo', `'foo' is a string!`))
  assert(!isString(3), `3 is not a string!`)
  assert(!isString(true), `true is not a string!`)
  assert(!isString(false), `false is not a string!`)
  assert(!isString({x: 5}), `{x: 5} is not a string!`)
  assert(!isString(["a", "b", "c"]), `["a", "b", "c"] is not a string!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78}],41:[function(require,module,exports){
function isUndefined(x){
  return x === null || typeof(x) === "undefined"
}

module.exports = isUndefined

// tests
if (!module.parent && typeof(window) === "undefined"){
  let assert = require("../misc/assert.js")

  assert(!isUndefined("foo"), `isUndefined("foo") should be false, but instead was true!`)
  assert(!isUndefined({}), `isUndefined({}) should be false, but instead was true!`)
  assert(!isUndefined(3), `isUndefined(3) should be false, but instead was true!`)
  assert(!isUndefined([]), `isUndefined([]) should be false, but instead was true!`)
  assert(!isUndefined(true), `isUndefined(true) should be false, but instead was true!`)
  assert(!isUndefined(false), `isUndefined(false) should be false, but instead was true!`)
  assert(!isUndefined(() => {}), `isUndefined(() => {}) should be false, but instead was true!`)

  let x
  assert(isUndefined(x), `isUndefined(x) should be true, but instead was false!`)

  let hasFailed

  try {
    hasFailed = false
    isUndefined(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `isUndefined(foo) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78}],42:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isNumber = require("./is-number.js")
let isUndefined = require("./is-undefined.js")
let vectorize = require("./vectorize.js")

let lerp = vectorize(function(a, b, f){
  assert(!isUndefined(a) && !isUndefined(b) && !isUndefined(f), "You must pass exactly three numbers (or three equally-sized arrays of numbers) into the `lerp` function!")

  assert(isNumber(a) && isNumber(b) && isNumber(f), "The `lerp` function only works on numbers!")

  return f * (b - a) + a
})

module.exports = lerp

// tests
if (!module.parent && typeof(window) === "undefined"){
  let a = 0
  let b = 1
  let f = 1
  let c = lerp(a, b, f)
  assert(c === 1, `lerp(0, 1, 1) should be 1, but instead was ${c}!`)

  a = -1
  b = 1
  f = 0.5
  c = lerp(a, b, f)
  assert(c === 0, `lerp(-1, 1, 0.5) should be 0, but instead was ${c}!`)

  a = -100
  b = 100
  f = 0.75
  c = lerp(a, b, f)
  assert(c === 50, `lerp(-100, 100, 0.75) should be 50, but instead was ${c}!`)

  a = [1, 2, 3]
  b = [2, 3, 4]
  f = [0.5, 0.75, 0.9]
  let cTrue = [1.5, 2.75, 3.9]
  let cPred = lerp(a, b, f)
  for (let i=0; i<cTrue.length; i++) assert(cTrue[i] === cPred[i], `lerp(${a[i]}, ${b[i]}, ${f[i]}) should be ${cTrue[i]}, but instead was ${cPred[i]}!`)

  let hasFailed

  try {
    hasFailed = false
    lerp(3, 4, "foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `lerp(3, 4, "foo") should have failed!`)

  try {
    hasFailed = false
    lerp([1], [2, 3], 0.75)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `lerp([1], [2, 3], 0.75) should have failed!`)

  try {
    hasFailed = false
    lerp({}, {}, {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `lerp({}, {}, {}) should have failed!`)

  try {
    let foo
    hasFailed = false
    lerp(foo, foo, foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `lerp(foo, foo, foo) should have failed!`)

  try {
    let fn = () => {}
    hasFailed = false
    lerp(fn, fn, fn)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `lerp(fn, fn, fn) should have failed!`)

  try {
    hasFailed = false
    lerp(1, 2)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `lerp(1, 2) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./is-number.js":39,"./is-undefined.js":41,"./vectorize.js":73}],43:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isNumber = require("./is-number.js")
let isUndefined = require("./is-undefined.js")
let vectorize = require("./vectorize.js")

let log = vectorize(function(x, base){
  assert(!isUndefined(x), "You must pass a single number or a single array of numbers into the `log` function!")
  assert(isNumber(x), "You must pass a single number or a single array of numbers into the `log` function!")

  base = isUndefined(base) ? Math.E : base
  assert(isNumber(base), "The base parameter of the `log` function must be a number or an array of numbers!")

  return Math.log(x) / Math.log(base)
})

module.exports = log

// tests
if (!module.parent && typeof(window) === "undefined"){
  let abs = require("./abs.js")
  let chop = require("./chop.js")

  let x = Math.E
  let base = Math.E
  let yTrue = 1
  let yPred = log(x, base)
  assert(yTrue === yPred, `log(${x}) should be ${yTrue}, but instead was ${yPred}!`)

  x = 10
  base = 10
  yTrue = 1
  yPred = log(x, base)
  assert(yTrue === yPred, `log(${x}) should be ${yTrue}, but instead was ${yPred}!`)

  x = 100
  base = 10
  yTrue = 2
  yPred = log(x, base)
  assert(yTrue === yPred, `log(${x}) should be ${yTrue}, but instead was ${yPred}!`)

  x = [100, 1000, 10000]
  base = 10
  yTrue = [2, 3, 4]
  yPred = log(x, base)
  for (let i=0; i<yTrue.length; i++) assert(chop(abs(yTrue[i] - yPred[i])) === 0, `log(${x[i]}, ${base}) should be ${yTrue[i]}, but instead was ${yPred[i]}!`)

  x = 64
  base = [2, 4, 8]
  yTrue = [6, 3, 2]
  yPred = log(x, base)
  for (let i=0; i<yTrue.length; i++) assert(chop(abs(yTrue[i] - yPred[i])) === 0, `log(${x[i]}, ${base}) should be ${yTrue[i]}, but instead was ${yPred[i]}!`)

  assert(log([]).length === 0, `log([]) should have produced an empty array!`)

  let hasFailed

  try {
    hasFailed = false
    log()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `log() should have failed!`)

  try {
    hasFailed = false
    log("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `log("foo") should have failed!`)

  try {
    hasFailed = false
    log({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `log({}) should have failed!`)

  try {
    hasFailed = false
    log(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `log(true) should have failed!`)

  try {
    hasFailed = false
    log(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `log(() => {}) should have failed!`)

  try {
    let foo
    hasFailed = false
    log(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `log(foo) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./abs.js":10,"./chop.js":17,"./is-number.js":39,"./is-undefined.js":41,"./vectorize.js":73}],44:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isNumber = require("./is-number.js")
let vectorize = require("./vectorize.js")

let map = vectorize(function(x, a, b, c, d){
  assert(!isUndefined(x) && !isUndefined(a) && !isUndefined(b) && !isUndefined(c) && !isUndefined(d), "You should pass five numbers (or five equally-sized arrays of numbers) into the `map` function!")

  assert(isNumber(x) && isNumber(a) && isNumber(b) && isNumber(c) && isNumber(d), "The `map` function only works on numbers!")

  return (d - c) * (x - a) / (b - a) + c
})

module.exports = map

// tests
if (!module.parent && typeof(window) === "undefined"){
  let x = 1
  let a = 0
  let b = 2
  let c = 0
  let d = 10
  let yTrue = 5
  let yPred = map(x, a, b, c, d)
  assert(yTrue === yPred, `map(${x}, ${a}, ${b}, ${c}, ${c}) should be ${yTrue}, but instead is ${yPred}!`)

  x = 2
  a = 1
  b = 3
  c = 100
  d = 500
  yTrue = 300
  yPred = map(x, a, b, c, d)
  assert(yTrue === yPred, `map(${x}, ${a}, ${b}, ${c}, ${c}) should be ${yTrue}, but instead is ${yPred}!`)

  x = [1, 2, 3]
  a = 0
  b = 4
  c = 100
  d = 500
  yTrue = [200, 300, 400]
  yPred = map(x, a, b, c, d)
  for (let i=0; i<yTrue.length; i++) assert(yTrue[i] === yPred[i], `map(${x[i]}, ${a}, ${b}, ${c}, ${d}) should be ${yTrue[i]}, but instead was ${yPred[i]}!`)

  let hasFailed

  try {
    hasFailed = false
    map(1, 2, 3, 4, "five")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `map(1, 2, 3, 4, "five") should have failed!`)

  try {
    hasFailed = false
    map()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `map() should have failed!`)

  try {
    hasFailed = false
    map(1, 2, 3, 4, {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `map(1, 2, 3, 4, {}) should have failed!`)

  try {
    let foo
    hasFailed = false
    map(1, 2, 3, 4, foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `map(1, 2, 3, 4, foo) should have failed!`)

  try {
    hasFailed = false
    map(1, 2, 3, 4, () => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `map(1, 2, 3, 4, () => {}) should have failed!`)

  try {
    hasFailed = false
    map(1, 2, 3, 4, true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `map(1, 2, 3, 4, true) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./is-number.js":39,"./is-undefined.js":41,"./vectorize.js":73}],45:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isArray = require("./is-array.js")
let isNumber = require("./is-number.js")
let isUndefined = require("./is-undefined.js")
let isString = require("./is-string.js")
let flatten = require("./flatten.js")

function max(arr){
  assert(!isUndefined(arr), "You must pass one array of numbers into the `max` function!")
  assert(isArray(arr), "You must pass one array of numbers into the `max` function!")

  let temp = flatten(arr)

  temp.forEach(function(value){
    assert(isNumber(value) || isString(value), "The `max` function only works on numbers or arrays of numbers!")
  })

  let out = -Infinity

  temp.forEach(function(x){
    if (x > out){
      out = x
    }
  })

  return out === -Infinity ? undefined : out
}

module.exports = max

// tests
if (!module.parent && typeof(window) === "undefined"){
  let normal = require("./normal.js")
  let random = require("./random.js")
  let min = require("./min.js")

  let x = [2, 3, 4]
  let y = max(x)
  assert(y === 4, `max([2, 3, 4]) should be 4, but instead was ${y}!`)

  x = [-10, -5, -20]
  y = max(x)
  assert(y === -5, `max([-10, -5, -20]) should be -5, but instead was ${y}!`)

  x = random([10000])
  y = max(x)
  assert(y <= 1 && y >= 0, `max(random([10000])) should be >= 0 and <= 1!`)

  x = normal([10000])
  xMin = min(x)
  xMax = max(x)
  xRange = xMax - xMin
  x = x.map(v => (v - xMin) / xRange)
  assert(max(x) === 1, `max(normalizedData) should be 1!`)

  let hasFailed

  try {
    hasFailed = false
    max()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `max() should have failed!`)

  try {
    hasFailed = false
    max(2)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `max(2) should have failed!`)

  try {
    hasFailed = false
    max(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `max(true) should have failed!`)

  try {
    hasFailed = false
    max({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `max({}) should have failed!`)

  try {
    hasFailed = false
    max(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `max(() => {}) should have failed!`)

  try {
    hasFailed = false
    max([1, 2, "three"])
  } catch(e){
    hasFailed = true
  }

  assert(!hasFailed, `max([1, 2, "three"]) should not have failed!`)

  try {
    hasFailed = false
    max("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `max("foo") should have failed!`)

  try {
    let foo
    hasFailed = false
    max(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `max(foo) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./flatten.js":31,"./is-array.js":35,"./is-number.js":39,"./is-string.js":40,"./is-undefined.js":41,"./min.js":48,"./normal.js":51,"./random.js":54}],46:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isArray = require("./is-array.js")
let isNumber = require("./is-number.js")
let flatten = require("./flatten.js")
let sum = require("./sum.js")

function mean(arr){
  assert(!isUndefined(arr), "You must pass one array of numbers into the `mean` function!")
  assert(isArray(arr), "You must pass one array of numbers into the `mean` function!")

  let temp = flatten(arr)

  temp.forEach(function(value){
    assert(isNumber(value), "The `mean` function only works on arrays of numbers!")
  })

  return sum(temp) / temp.length
}

module.exports = mean

// tests
if (!module.parent && typeof(window) === "undefined"){
  let normal = require("./normal.js")
  let random = require("./random.js")
  let abs = require("./abs.js")

  let x = [2, 3, 4]
  let yTrue = 3
  let yPred = mean(x)
  assert(yTrue === yPred, `mean(2, 3, 4) should be 3, but instead is ${yPred}!`)

  x = normal([10000])
  yPred = mean(x)
  assert(abs(yPred) < 0.05, `mean(normal([10000])) should be approximately 0, but instead was ${yPred}!`)

  x = random([10000])
  yPred = mean(x)
  assert(yPred - 0.5 < 0.05, `mean(random([10000])) should be approximately 0.5, but instead was ${yPred}!`)

  x = normal([10, 10, 10, 10])
  yPred = mean(x)
  assert(abs(yPred) < 0.05, `mean(normal([10, 10, 10, 10])) should be approximately 0, but instead was ${yPred}!`)

  let hasFailed

  try {
    hasFailed = false
    mean()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `mean() should have failed!`)

  try {
    hasFailed = false
    mean("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `mean("foo") should have failed!`)

  try {
    hasFailed = false
    mean({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `mean({}) should have failed!`)

  try {
    hasFailed = false
    mean(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `mean(true) should have failed!`)

  try {
    let foo
    hasFailed = false
    mean(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `mean(foo) should have failed!`)

  try {
    hasFailed = false
    mean(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `mean(() => {}) should have failed!`)

  try {
    hasFailed = false
    mean([1, 2, "three"])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `mean([1, 2, "three"]) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./abs.js":10,"./flatten.js":31,"./is-array.js":35,"./is-number.js":39,"./is-undefined.js":41,"./normal.js":51,"./random.js":54,"./sum.js":69}],47:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isArray = require("./is-array.js")
let isNumber = require("./is-number.js")
let flatten = require("./flatten.js")
let sort = require("./sort.js")

function median(arr){
  assert(!isUndefined(arr), "You must pass one array of numbers into the `median` function!")
  assert(isArray(arr), "You must pass one array of numbers into the `median` function!")

  let temp = flatten(arr)

  temp.forEach(function(item){
    assert(isNumber(item), "The `median` function only works on numbers!")
  })

  temp = sort(temp, function(a, b){
    if (a < b) return -1
    if (a > b) return 1
    return 0
  })

  let out

  if (temp.length % 2 === 0){
    out = (temp[temp.length / 2 - 1] + temp[temp.length / 2]) / 2
  } else {
    out = temp[Math.floor(temp.length / 2)]
  }

  return out
}

module.exports = median

// tests
if (!module.parent && typeof(window) === "undefined"){
  let shuffle = require("./shuffle.js")
  let normal = require("./normal.js")
  let random = require("./random.js")
  let round = require("./round.js")
  let scale = require("./scale.js")

  let x = [2, 4, 3]
  let yTrue = 3
  let yPred = median(x)
  assert(yTrue === yPred, `median([2, 4, 3]) should be 3, but instead was ${yPred}!`)

  let x1 = round(scale(random([5, 5, 5, 5]), 100))
  let x2 = shuffle(x1)
  let x3 = shuffle(x1)
  let x4 = shuffle(x1)
  let y1 = median(x1)
  let y2 = median(x2)
  let y3 = median(x3)
  let y4 = median(x4)
  assert(y1 === y2 && y2 === y3 && y3 === y4, "The `median` function should return the same median for shuffled versions of the same array!")

  assert(isNaN(median([])), `median([]) should be NaN!`)

  let hasFailed

  try {
    hasFailed = false
    median()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `median() should have failed!`)

  try {
    hasFailed = false
    median("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `median("foo") should have failed!`)

  try {
    hasFailed = false
    median([1, 2, "three"])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `median([1, 2, "three"]) should have failed!`)

  try {
    hasFailed = false
    median([true])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `median([true]) should have failed!`)

  try {
    hasFailed = false
    median([{}])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `median([{}]) should have failed!`)

  try {
    let foo
    hasFailed = false
    median([foo, foo, foo])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `median([foo, foo, foo]) should have failed!`)

  try {
    let fn = () => {}
    hasFailed = false
    median([fn, fn, fn,])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `median([fn, fn, fn]) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./flatten.js":31,"./is-array.js":35,"./is-number.js":39,"./is-undefined.js":41,"./normal.js":51,"./random.js":54,"./round.js":57,"./scale.js":58,"./shuffle.js":62,"./sort.js":66}],48:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isArray = require("./is-array.js")
let isNumber = require("./is-number.js")
let isString = require("./is-string.js")
let flatten = require("./flatten.js")

function min(arr){
  assert(!isUndefined(arr), "You must pass one array of numbers into the `min` function!")
  assert(isArray(arr), "You must pass one array of numbers into the `min` function!")

  let temp = flatten(arr)

  temp.forEach(function(item){
    assert(isNumber(item) || isString(item), "The `min` function only works on arrays of numbers and/or strings!")
  })

  let out = Infinity

  temp.forEach(function(x){
    if (x < out){
      out = x
    }
  })

  return out === Infinity ? undefined : out
}

module.exports = min

// tests
if (!module.parent && typeof(window) === "undefined"){
  let random = require("./random.js")

  let x = [4, 2, 3]
  let yTrue = 2
  let yPred = min(x)
  assert(yTrue === yPred, `min([4, 2, 3]) should be 2, but instead was ${yPred}!`)

  x = [[-50, 50, 234], [100, -100, 0]]
  yTrue = -100
  yPred = min(x)
  assert(yTrue === yPred, `min([[-50, 50, 234], [100, -100, 0]]) should be -100, but instead was ${yPred}!`)

  x = random([2, 3, 4, 5])
  yPred = min(x)
  assert(yPred <= 1 && yPred >= 0, `min(random([2, 3, 4, 5])) should be >= 0 and <= 1!`)

  let hasFailed

  try {
    hasFailed = false
    min()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `min() should have failed!`)

  try {
    hasFailed = false
    min(234)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `min(234) should have failed!`)

  try {
    hasFailed = false
    min({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `min({}) should have failed!`)

  try {
    hasFailed = false
    min("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `min("foo") should have failed!`)

  try {
    hasFailed = false
    min(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `min(true) should have failed!`)

  try {
    hasFailed = false
    min([1, 2, "three"])
  } catch(e){
    hasFailed = true
  }

  assert(!hasFailed, `min([1, 2, "three"]) should not have failed!`)

  try {
    hasFailed = false
    min([() => {}])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `min([() => {}]) should have failed!`)

  try {
    let foo
    hasFailed = false
    min([foo, foo, foo])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `min([foo, foo, foo]) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./flatten.js":31,"./is-array.js":35,"./is-number.js":39,"./is-string.js":40,"./is-undefined.js":41,"./random.js":54}],49:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isArray = require("./is-array.js")
let flatten = require("./flatten.js")
let count = require("./count.js")
let set = require("./set.js")
let sort = require("./sort.js")

function mode(arr){
  assert(!isUndefined(arr), "You must pass one array into the `mode` function!")
  assert(isArray(arr), "You  must pass one array into the `mode` function!")

  let temp = flatten(arr)
  let counts = {}
  let refs = {}
  let tempSet = set(temp)

  tempSet.forEach(function(item){
    counts[item] = count(temp, item)
    refs[item] = item
  })

  let sortedTempSet = sort(tempSet, function(a, b){
    let count1 = counts[a]
    let count2 = counts[b]

    if (count1 > count2) return -1
    if (count1 < count2) return 1
    return 0
  })

  let mostCountedItem = sortedTempSet[0]
  let out = sortedTempSet.filter(item => counts[item] === counts[mostCountedItem])
  return out
}

module.exports = mode

// tests
if (!module.parent && typeof(window) === "undefined"){
  let random = require("./random.js")
  let round = require("./round.js")
  let shuffle = require("./shuffle.js")
  let scale = require("./scale.js")

  let x = [2, 3, 3, 3, 2, 4]
  let yTrue = [3]
  let yPred = mode(x)
  for (let i=0; i<yTrue.length; i++) assert(yTrue[i] === yPred[i], `mode([2, 3, 3, 3, 2, 4]) should be 3, but instead was ${yPred}!`)

  let x1 = round(scale(random([5, 5, 5, 5]), 100))
  let x2 = shuffle(x1)
  let x3 = shuffle(x1)
  let x4 = shuffle(x1)
  let y1 = mode(x1)
  let y2 = mode(x2)
  let y3 = mode(x3)
  let y4 = mode(x4)
  for (let i=0; i<y1.length; i++) assert(y1[i] === y2[i], "The `mode` function should return the same mode for shuffled versions of the same array!")
  for (let i=0; i<y1.length; i++) assert(y2[i] === y3[i], "The `mode` function should return the same mode for shuffled versions of the same array!")
  for (let i=0; i<y1.length; i++) assert(y3[i] === y4[i], "The `mode` function should return the same mode for shuffled versions of the same array!")

  let hasFailed

  try {
    hasFailed = false
    mode()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `mode() should have failed!`)

  try {
    hasFailed = false
    mode("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `mode("foo") should have failed!`)

  try {
    hasFailed = false
    mode({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `mode({}) should have failed!`)

  try {
    hasFailed = false
    mode(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `mode(() => {}) should have failed!`)

  try {
    hasFailed = false
    mode(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `mode(true) should have failed!`)

  try {
    hasFailed = false
    mode()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `mode() should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./count.js":26,"./flatten.js":31,"./is-array.js":35,"./is-undefined.js":41,"./random.js":54,"./round.js":57,"./scale.js":58,"./set.js":60,"./shuffle.js":62,"./sort.js":66}],50:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isArray = require("./is-array.js")
let isNumber = require("./is-number.js")
let floor = require("./floor.js")
let range = require("./range.js")

let error = "You must pass an integer or a one-dimensional array of integers into the `ndarray` function!"

function ndarray(shape){
  assert(!isUndefined(shape), error)

  if (!isArray(shape)) shape = [shape]

  assert(shape.length > 0, error)

  shape.forEach(function(x){
    assert(isNumber(x), error)
    assert(floor(x) === x, error)
    assert(x >= 0, error)
  })

  if (shape.length === 1){
    return range(0, shape[0]).map(v => undefined)
  } else {
    let out = []
    for (let i=0; i<shape[0]; i++) out.push(ndarray(shape.slice(1, shape.length)))
    return out
  }
}

module.exports = ndarray

// tests
if (!module.parent && typeof(window) === "undefined"){
  let flatten = require("./flatten.js")

  assert(ndarray(3).length === 3, `ndarray(3) should have a length of 3!`)
  assert(ndarray([3]).length === 3, `ndarray([3]) should have a length of 3!`)
  assert(ndarray([3, 2]).length === 3, `ndarray([3, 2]) should have a length of 3!`)
  assert(flatten(ndarray([2, 3, 4])).length === 24, `flatten(ndarray([2, 3, 4])) should have a length of 24!`)

  let hasFailed

  try {
    hasFailed = false
    ndarray()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `ndarray() should have failed!`)

  try {
    hasFailed = false
    ndarray("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `ndarray("foo") should have failed!`)

  try {
    hasFailed = false
    ndarray(3.5)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `ndarray(3.5) should have failed!`)

  try {
    hasFailed = false
    ndarray(-10)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `ndarray(-10) should have failed!`)

  try {
    hasFailed = false
    ndarray({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `ndarray({}) should have failed!`)

  try {
    hasFailed = false
    ndarray(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `ndarray(true) should have failed!`)

  try {
    hasFailed = false
    ndarray([])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `ndarray([]) should have failed!`)

  try {
    hasFailed = false
    ndarray(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `ndarray(() => {}) should have failed!`)

  try {
    let foo
    hasFailed = false
    ndarray(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `ndarray(foo) should have failed!`)

  try {
    hasFailed = false
    ndarray([1, 2, "three"])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `ndarray([1, 2, "three"]) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./flatten.js":31,"./floor.js":32,"./is-array.js":35,"./is-number.js":39,"./is-undefined.js":41,"./range.js":55}],51:[function(require,module,exports){
let isUndefined = require("./is-undefined.js")
let ndarray = require("./ndarray.js")
let apply = require("../misc/apply.js")
let random = require("./random.js")

function normal(shape){
  function n(){
    let u1 = random()
    let u2 = random()
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  }

  if (isUndefined(shape)) return n()
  return apply(ndarray(shape), n)
}

module.exports = normal

// tests
if (!module.parent && typeof(window) === "undefined"){
  let assert = require("../misc/assert.js")
  let std = require("./std.js")
  let mean = require("./mean.js")
  let abs = require("./abs.js")
  let seed = require("./seed.js")
  let distance = require("./distance.js")

  let x = normal([10000])
  let m = mean(x)
  let s = std(x)

  assert(abs(m) < 0.05, `normal([10000]) should have a mean of approximately 0!`)
  assert(abs(s - 1) < 0.05, `normal([10000]) should have a standard deviation of approximately 1!`)

  x = normal([10, 10, 10, 10])
  m = mean(x)
  s = std(x)

  assert(abs(m) < 0.05, `normal([10, 10, 10, 10]) should have a mean of approximately 0!`)
  assert(abs(s - 1) < 0.05, `normal([10, 10, 10, 10]) should have a standard deviation of approximately 1!`)

  seed(230498230498)
  let a = normal(10000)
  seed(230498230498)
  let b = normal(10000)
  assert(distance(a, b) === 0, "Two normally-distributed arrays seeded with the same value should be identical!")

  let hasFailed

  try {
    hasFailed = false
    normal("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `normal("foo") should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/apply.js":76,"../misc/assert.js":78,"./abs.js":10,"./distance.js":28,"./is-undefined.js":41,"./mean.js":46,"./ndarray.js":50,"./random.js":54,"./seed.js":59,"./std.js":68}],52:[function(require,module,exports){
let ndarray = require("./ndarray.js")
let apply = require("../misc/apply.js")

function ones(shape){
  return apply(ndarray(shape), v => 1)
}

module.exports = ones

// tests
if (!module.parent && typeof(window) === "undefined"){
  let assert = require("../misc/assert.js")
  let sum = require("./sum.js")
  let mean = require("./mean.js")
  let std = require("./std.js")
  let flatten = require("./flatten.js")

  let x = ones([2, 3, 4, 5])
  assert(sum(x) === 2 * 3 * 4 * 5, `sum(ones([2, 3, 4, 5])) should be 2 * 3 * 4 * 5!`)
  assert(mean(x) === 1, `mean(ones([2, 3, 4, 5])) should be 1!`)
  assert(std(x) === 0, `std(ones([2, 3, 4, 5])) should be 0!`)
  assert(sum(x) === flatten(x).length, `sum(ones([2, 3, 4, 5])) should be the same as flatten(ones([2, 3, 4, 5])).length!`)

  let hasFailed

  try {
    hasFailed = false
    ones()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `ones() should have failed!`)

  try {
    hasFailed = false
    ones("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `ones("foo") should have failed!`)

  try {
    hasFailed = false
    ones(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `ones(true) should have failed!`)

  try {
    hasFailed = false
    ones({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `ones({}) should have failed!`)

  try {
    let foo
    hasFailed = false
    ones(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `ones(foo) should have failed!`)

  try {
    hasFailed = false
    ones([1, 2, "three"])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `ones([1, 2, "three"]) should have failed!`)

  try {
    hasFailed = false
    ones(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `ones(() => {}) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/apply.js":76,"../misc/assert.js":78,"./flatten.js":31,"./mean.js":46,"./ndarray.js":50,"./std.js":68,"./sum.js":69}],53:[function(require,module,exports){
let vectorize = require("./vectorize.js")
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isNumber = require("./is-number.js")

let pow = vectorize(function(x, p){
  assert(!isUndefined(x) && !isUndefined(p), "You must pass two numbers (or two equally-sized arrays of numbers) into the `pow` function!")
  assert(isNumber(x) && isNumber(p), "You must pass two numbers (or two equally-sized arrays of numbers) into the `pow` function!")

  return Math.pow(x, p)
})

module.exports = pow

// tests
if (!module.parent && typeof(window) === "undefined"){
  let x = 3
  let p = 2
  let yTrue = 9
  let yPred = pow(x, p)
  assert(yTrue === yPred, `pow(${x}, ${p}) should be ${yTrue}, but instead was ${yPred}!`)

  x = [3, 4, 5]
  p = 2
  yTrue = [9, 16, 25]
  yPred = pow(x, p)
  for (let i=0; i<yTrue.length; i++) assert(yTrue[i] === yPred[i], `pow(${x[i]}, ${p}) should be ${yTrue[i]}, but instead was ${yPred[i]}!`)

  x = 3
  p = [2, 3, 4]
  yTrue = [9, 27, 81]
  yPred = pow(x, p)
  for (let i=0; i<yTrue.length; i++) assert(yTrue[i] === yPred[i], `pow(${x}, ${p[i]}) should be ${yTrue[i]}, but instead was ${yPred[i]}!`)

  x = [2, 3, 4]
  p = [2, 3, 4]
  yTrue = [4, 27, 256]
  yPred = pow(x, p)
  for (let i=0; i<yTrue.length; i++) assert(yTrue[i] === yPred[i], `pow(${x[i]}, ${p[i]}) should be ${yTrue[i]}, but instead was ${yPred[i]}!`)

  let hasFailed

  try {
    hasFailed = false
    pow()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `pow() should have failed!`)

  try {
    hasFailed = false
    pow(2)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `pow(2) should have failed!`)

  try {
    hasFailed = false
    pow(2, "three")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `pow(2, "three") should have failed!`)

  try {
    hasFailed = false
    pow("two", 3)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `pow("two", 3) should have failed!`)

  try {
    hasFailed = false
    pow(true, true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `pow(true, true) should have failed!`)

  try {
    hasFailed = false
    pow({}, {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `pow({}, {}) should have failed!`)

  try {
    let foo
    hasFailed = false
    pow(foo, foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `pow(foo, foo) should have failed!`)

  try {
    let fn = () => {}
    hasFailed = false
    pow(fn, fn)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `pow(fn, fn) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./is-number.js":39,"./is-undefined.js":41,"./vectorize.js":73}],54:[function(require,module,exports){
let ndarray = require("./ndarray.js")
let apply = require("../misc/apply.js")
let isUndefined = require("./is-undefined.js")
let seed = require("./seed.js")
let pow = require("./pow.js")

let a = 1103515245
let c = 12345
let m = pow(2, 31)

function lcg(){
  let s = seed()
  let out = (a * s + c) % m
  seed(out)
  return out / m
}

function random(shape){
  if (isUndefined(shape)) return lcg()
  return apply(ndarray(shape), lcg)
}

module.exports = random

// tests
if (!module.parent && typeof(window) === "undefined"){
  let assert = require("../misc/assert.js")
  let distance = require("./distance.js")
  let min = require("./min.js")
  let max = require("./max.js")
  let abs = require("./abs.js")
  let mean = require("./mean.js")

  let x = random([10, 10, 10, 10])
  assert(min(x) >= 0 && max(x) <= 1, `random([10, 10, 10, 10]) should be in the range [0, 1]!`)
  assert(abs(mean(x)) - 0.5 < 0.05, `random([10, 10, 10, 10]) should have a mean of approximately 0.5!`)

  x = random()
  assert(x >= 0 && x <= 1, `random() should be in the range [0, 1]!`)

  seed(203948203948)
  let a = random([10, 10, 10, 10])
  seed(203948203948)
  let b = random([10, 10, 10, 10])
  assert(distance(a, b) === 0, "Two random arrays seeded with the same value should be identical!")

  let hasFailed

  try {
    hasFailed = false
    random("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `random("foo") should have failed!`)

  try {
    hasFailed = false
    random(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `random(true) should have failed!`)

  try {
    hasFailed = false
    random({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `random({}) should have failed!`)

  try {
    hasFailed = false
    random(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `random(() => {}) should have failed!`)

  try {
    hasFailed = false
    random([1, 2, "three"])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `random([1, 2, "three"]) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/apply.js":76,"../misc/assert.js":78,"./abs.js":10,"./distance.js":28,"./is-undefined.js":41,"./max.js":45,"./mean.js":46,"./min.js":48,"./ndarray.js":50,"./pow.js":53,"./seed.js":59}],55:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isNumber = require("./is-number.js")

function range(a, b, step=1){
  assert(!isUndefined(a) && !isUndefined(b) && !isUndefined(step), "You must pass two numbers and optionally a step value to the `range` function!")
  assert(isNumber(a) && isNumber(b) && isNumber(step), "You must pass two numbers and optionally a step value to the `range` function!")
  assert(step > 0, "The step value must be greater than 0! (NOTE: The step value is a magnitude; it does not indicate direction.)")

  let shouldReverse = false

  if (a > b){
    shouldReverse = true
    let buffer = a
    a = b + step
    b = buffer + step
  }

  let out = []
  for (let i=a; i<b; i+=step) out.push(i)
  if (shouldReverse) out.reverse()
  return out
}

module.exports = range

// tests
if (!module.parent && typeof(window) === "undefined"){
  let yTrue = [5, 6, 7, 8, 9]
  let yPred = range(5, 10)
  for (let i=0; i<yTrue; i++) assert(yTrue[i] === yPred[i], `range(5, 10) should be [5, 6, 7, 8, 9]!`)

  yTrue = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5]
  yPred = range(5, 10, 0.5)
  for (let i=0; i<yTrue; i++) assert(yTrue[i] === yPred[i], `range(5, 10, 0.5) should be [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5]!`)

  yTrue = [3, 2, 1, 0, -1, -2]
  yPred = range(3, -3)
  for (let i=0; i<yTrue; i++) assert(yTrue[i] === yPred[i], `range(3, -3) should be [3, 2, 1, 0, -1, -2]!`)

  yTrue = [-1, -1.25, -1.5, -1.75]
  yPred = range(-1, -2, 0.25)
  for (let i=0; i<yTrue; i++) assert(yTrue[i] === yPred[i], `range(-1, -2, 0.25) should be [-1, -1.25, -1.5, -1.75]!`)

  let hasFailed

  try {
    hasFailed = false
    range()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `range() should have failed!`)

  try {
    hasFailed = false
    range(1, 2, -3)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `range(1, 2, -3) should have failed!`)

  try {
    hasFailed = false
    range("foo", "bar", "baz")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `range("foo", "bar", "baz") should have failed!`)

  try {
    hasFailed = false
    range([], [], [])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `range([], [], []) should have failed!`)

  try {
    hasFailed = false
    range(true, true, true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `range(true, true, true) should have failed!`)

  try {
    hasFailed = false
    range({}, {}, {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `range({}, {}, {}) should have failed!`)

  try {
    let foo
    hasFailed = false
    range(foo, foo, foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `range(foo, foo, foo) should have failed!`)

  try {
    let fn = () => {}
    hasFailed = false
    range(fn, fn, fn)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `range(fn, fn, fn) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./is-number.js":39,"./is-undefined.js":41}],56:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isArray = require("./is-array.js")

function reverse(arr){
  assert(!isUndefined(arr), "You must pass an array into the `reverse` function!")
  assert(isArray(arr), "You must pass an array into the `reverse` function!")

  let out = []
  for (let i=arr.length-1; i>=0; i--) out.push(arr[i])
  return out
}

module.exports = reverse

// tests
if (!module.parent && typeof(window) === "undefined"){
  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./is-array.js":35,"./is-undefined.js":41}],57:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isNumber = require("./is-number.js")
let vectorize = require("./vectorize.js")

let round = vectorize(function(x){
  assert(!isUndefined(x), "You must pass a number or an array of numbers into the `round` function!")
  assert(isNumber(x), "You must pass a number or an array of numbers into the `round` function!")

  return Math.round(x)
})

module.exports = round

// tests
if (!module.parent && typeof(window) === "undefined"){
  let random = require("./random.js")
  let set = require("./set.js")
  let sort = require("./sort.js")

  let yTrue = 2
  let yPred = round(2.34)
  assert(yTrue === yPred, `round(2.34) should be 2, but instead was ${yPred}!`)

  yTrue = 3
  yPred = round(2.5)
  assert(yTrue === yPred, `round(2.5) should be 3, but instead was ${yPred}!`)

  yTrue = -4
  yPred = round(-3.75)
  assert(yTrue === yPred, `round(-3.75) should be -4, but instead was ${yPred}!`)

  yPred = sort(set(round(random([10, 10, 10, 10]))), function(a, b){
    if (a < b) return -1
    if (a > b) return 1
    return 0
  })

  assert(yPred[0] === 0 && yPred[1] === 1 && yPred.length === 2, `sort(set(round(random([10, 10, 10, 10])))) should be [0, 1]!`)

  let hasFailed

  try {
    hasFailed = false
    round()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `round() should have failed!`)

  try {
    hasFailed = false
    round("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `round("foo") should have failed!`)

  try {
    hasFailed = false
    round(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `round(true) should have failed!`)

  try {
    hasFailed = false
    round({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `round({}) should have failed!`)

  try {
    hasFailed = false
    round(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `round(() => {}) should have failed!`)

  try {
    let foo
    hasFailed = false
    round(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `round(foo) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./is-number.js":39,"./is-undefined.js":41,"./random.js":54,"./set.js":60,"./sort.js":66,"./vectorize.js":73}],58:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isNumber = require("./is-number.js")
let vectorize = require("./vectorize.js")

let scale = vectorize(function(a, b){
  assert(!isUndefined(a) && !isUndefined(b), "You must pass two numbers (or an array of numbers and a number, or a number and an array of numbers, or two arrays of numbers) into the `scale` function!")
  assert(isNumber(a) && isNumber(b), "You must pass two numbers (or an array of numbers and a number, or a number and an array of numbers, or two arrays of numbers) into the `scale` function!")

  return a * b
})

module.exports = scale

// tests
if (!module.parent && typeof(window) === "undefined"){
  let a = 3
  let b = 5
  let yTrue = 15
  let yPred = scale(a, b)
  assert(yTrue === yPred, `scale(${a}, ${b}) should be ${yTrue}, but instead was ${yPred}!`)

  a = [3, 4, 5]
  b = 5
  yTrue = [15, 20, 25]
  yPred = scale(a, b)
  for (let i=0; i<yTrue.length; i++) assert(yTrue[i] === yPred[i], `scale(${a[i]}, ${b}) should be ${yTrue[i]}, but instead was ${yPred[i]}!`)

  a = 3
  b = [5, 6, 7]
  yTrue = [15, 18, 21]
  yPred = scale(a, b)
  for (let i=0; i<yTrue.length; i++) assert(yTrue[i] === yPred[i], `scale(${a}, ${b[i]}) should be ${yTrue[i]}, but instead was ${yPred[i]}!`)

  a = [2, 3, 4]
  b = [5, 6, 7]
  yTrue = [10, 18, 28]
  yPred = scale(a, b)
  for (let i=0; i<yTrue.length; i++) assert(yTrue[i] === yPred[i], `scale(${a[i]}, ${b[i]}) should be ${yTrue[i]}, but instead was ${yPred[i]}!`)

  let hasFailed

  try {
    hasFailed = false
    scale()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `scale() should have failed!`)

  try {
    hasFailed = false
    scale("two", "three")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `scale("two", "three") should have failed!`)

  try {
    hasFailed = false
    scale(true, false)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `scale(true, false) should have failed!`)

  try {
    hasFailed = false
    scale({}, {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `scale({}, {}) should have failed!`)

  try {
    let fn = () => {}
    hasFailed = false
    scale(fn, fn)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `scale(fn, fn) should have failed!`)

  try {
    let foo
    hasFailed = false
    scale(foo, foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `scale(foo, foo) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./is-number.js":39,"./is-undefined.js":41,"./vectorize.js":73}],59:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isNumber = require("./is-number.js")
let s = parseInt(Math.random() * 999999)

function seed(val){
  if (!isUndefined(val)){
    assert(isNumber(val), "If passing a value into the `seed` function, then that value must be a positive integer!")
    assert(parseInt(val) === val, "If passing a value into the `seed` function, then that value must be a positive integer!")
    assert(val >= 0, "If passing a value into the `seed` function, then that value must be a positive integer!")
  }

  if (!isUndefined(val)) s = val
  else return s
}

module.exports = seed

},{"../misc/assert.js":78,"./is-number.js":39,"./is-undefined.js":41}],60:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isArray = require("./is-array.js")
let flatten = require("./flatten.js")

function set(arr){
  assert(!isUndefined(arr), "You must pass an array into the `set` function!")
  assert(isArray(arr), "You must pass an array into the `set` function!")

  let out = []

  flatten(arr).forEach(function(item){
    if (out.indexOf(item) < 0) out.push(item)
  })

  return out
}

module.exports = set

// tests
if (!module.parent && typeof(window) === "undefined"){
  let sort = require("./sort.js")
  let round = require("./round.js")
  let random = require("./random.js")
  let range = require("./range.js")

  function alphasort(a, b){
    if (a < b) return -1
    if (a > b) return 1
    return 0
  }

  let x = [2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 3, 4, 3, 2, 2, 3, 3, 3, 3, 4]
  let yTrue = [2, 3, 4]
  let yPred = sort(set(x), alphasort)
  for (let i=0; i<yTrue.length; i++) assert(yTrue[i] === yPred[i], `set([2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 3, 4, 3, 2, 2, 3, 3, 3, 3, 4]) should be [2, 3, 4]!`)

  x = round(random([10, 10, 10, 10]))
  yTrue = [0, 1]
  yPred = sort(set(x), alphasort)
  for (let i=0; i<yTrue.length; i++) assert(yTrue[i] === yPred[i], `set(round(random([10, 10, 10, 10]))) should be [0, 1]!`)

  x = range(10, 20, 0.25)
  yTrue = x.slice()
  yPred = set(x)
  for (let i=0; i<yTrue.length; i++) assert(yTrue[i] === yPred[i], `set(range(10, 20, 0.25)) should be the same as range(10, 20, 0.25)!`)

  x = ["foo", "bar", "baz", "foo", "foo", true, true, false, true, 234, 234, 0]
  yTrue = ["foo", "bar", "baz", true, false, 234, 0]
  yPred = set(x)
  for (let i=0; i<yTrue.length; i++) assert(yTrue[i] === yPred[i], `set(["foo", "bar", "baz", "foo", "foo", true, true, false, true, 234, 234, 0]) should be ["foo", "bar", "baz", true, false, 234, 0]!`)

  let hasFailed

  try {
    hasFailed = false
    set()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `set() should have failed!`)

  try {
    hasFailed = false
    set("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `set("foo") should have failed!`)

  try {
    hasFailed = false
    set(234)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `set(234) should have failed!`)

  try {
    hasFailed = false
    set(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `set(true) should have failed!`)

  try {
    hasFailed = false
    set({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `set({}) should have failed!`)

  try {
    hasFailed = false
    set(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `set(() => {}) should have failed!`)

  try {
    let foo
    hasFailed = false
    set(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `set(foo) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./flatten.js":31,"./is-array.js":35,"./is-undefined.js":41,"./random.js":54,"./range.js":55,"./round.js":57,"./sort.js":66}],61:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isArray = require("./is-array.js")
let max = require("./max.js")

function shape(arr){
  assert(!isUndefined(arr), "You must pass an array into the `shape` function!")
  assert(isArray(arr), "You must pass an array into the `shape` function!")

  let out = [arr.length]
  let childrenAreArrays = arr.map(x => isArray(x))

  if (childrenAreArrays.indexOf(true) > -1){
    assert(childrenAreArrays.indexOf(false) < 0, "The array passed into the `shape` function has some children that are not themselves arrays!")

    let lengths = arr.map(x => x.length)
    let maxLength = max(lengths)

    lengths.forEach(function(length){
      assert(length === maxLength, "The array passed into the `shape` function has some children of inconsistent length!")
    })

    out = out.concat(shape(arr[0]))
  }

  return out
}

module.exports = shape

// tests
if (!module.parent && typeof(window) === "undefined"){
  let normal = require("./normal.js")

  let yTrue = 500
  let yPred = shape(normal(yTrue))[0]
  assert(yTrue === yPred, `shape(normal(500)) should be 500, but instead was ${yPred}!`)

  yTrue = [2, 3, 4]
  yPred = shape(normal(yTrue))
  for (let i=0; i<yTrue.shape; i++) assert(yTrue[i] === yPred[i], `shape(normal([2, 3, 4])) should be [2, 3, 4]!`)

  let hasFailed

  try {
    hasFailed = false
    shape()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `shape() should have failed!`)

  try {
    hasFailed = false
    shape("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `shape("foo") should have failed!`)

  try {
    hasFailed = false
    shape(234)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `shape(234) should have failed!`)

  try {
    hasFailed = false
    shape(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `shape(true) should have failed!`)

  try {
    hasFailed = false
    shape({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `shape({}) should have failed!`)

  try {
    hasFailed = false
    shape(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `shape(() => {}) should have failed!`)

  try {
    let foo
    hasFailed = false
    shape(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `shape(foo) should have failed!`)

  try {
    hasFailed = false
    shape([[2, 3, 4], [5, 6]])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `shape([[2, 3, 4], [5, 6]]) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./is-array.js":35,"./is-undefined.js":41,"./max.js":45,"./normal.js":51}],62:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isArray = require("./is-array.js")
let floor = require("./floor.js")
let random = require("./random.js")

function shuffle(arr){
  assert(!isUndefined(arr), "You must pass an array into the `shuffle` function!")
  assert(isArray(arr), "You must pass an array into the `shuffle` function!")

  let out = arr.slice()

  for (let i=0; i<arr.length; i++){
    let index1 = floor(random() * arr.length)
    let index2 = floor(random() * arr.length)
    let buffer = out[index1]
    out[index1] = out[index2]
    out[index2] = buffer
  }

  return out
}

module.exports = shuffle

// tests
if (!module.parent && typeof(window) === "undefined"){
  let normal = require("./normal.js")
  let seed = require("./seed.js")
  let distance = require("./distance.js")

  let a = normal(10000)
  let b = shuffle(a)

  assert(distance(a, b) > 0, `shuffle(a) should not be in the same order as a!`)

  a = normal(10000)
  seed(20394230948)
  a1 = shuffle(a)
  seed(20394230948)
  a2 = shuffle(a)

  assert(distance(a1, a2) === 0, `Shuffling using the same seed should produce the same results!`)

  let hasFailed

  try {
    hasFailed = false
    shuffle()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `shuffle() should have failed!`)

  try {
    hasFailed = false
    shuffle("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `shuffle("foo") should have failed!`)

  try {
    hasFailed = false
    shuffle(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `shuffle(true) should have failed!`)

  try {
    hasFailed = false
    shuffle({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `shuffle({}) should have failed!`)

  try {
    hasFailed = false
    shuffle(234)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `shuffle(234) should have failed!`)

  try {
    hasFailed = false
    shuffle(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `shuffle(() => {}) should have failed!`)

  try {
    hasFailed = false
    shuffle(random([2, 3, 4]))
  } catch(e){
    hasFailed = true
  }

  assert(!hasFailed, `shuffle(random([2, 3, 4])) should not have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./distance.js":28,"./floor.js":32,"./is-array.js":35,"./is-undefined.js":41,"./normal.js":51,"./random.js":54,"./seed.js":59}],63:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isNumber = require("./is-number.js")
let vectorize = require("./vectorize.js")

let sign = vectorize(function(x){
  assert(!isUndefined(x), "You must pass a number or an array of numbers into the `sign` function!")
  assert(isNumber(x), "You must pass a number or an array of numbers into the `sign` function!")

  if (x < 0) return -1
  if (x > 0) return 1
  return 0
})

module.exports = sign

// tests
if (!module.parent && typeof(window) === "undefined"){
  let random = require("./random.js")
  let normal = require("./normal.js")
  let round = require("./round.js")
  let set = require("./set.js")
  let sort = require("./sort.js")
  let chop = require("./chop.js")
  let scale = require("./scale.js")
  let add = require("./add.js")

  let x = sort(set(sign(chop(normal(10000)))).concat(0))
  assert(x[0] === -1 && x[1] === 0 && x[2] === 1, `sort(set(sign(chop(normal(10000))))) should be [-1, 0, 1]!`)

  x = sign(add(random(10000), 100))
  x.forEach(v => assert(v >= 0), `sign(add(random(10000), 100)) should only result in positive values!`)

  x = sign(scale(random(10000), -1))
  x.forEach(v => assert(v <= 0), `sign(scale(random(10000), -1)) should only result in negative values!`)

  let hasFailed

  try {
    hasFailed = false
    sign()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sign() should have failed!`)

  try {
    hasFailed = false
    sign("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sign("foo") should have failed!`)

  try {
    hasFailed = false
    sign(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sign(true) should have failed!`)

  try {
    hasFailed = false
    sign({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sign({}) should have failed!`)

  try {
    hasFailed = false
    sign(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sign(() => {}) should have failed!`)

  try {
    let foo
    hasFailed = false
    sign(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sign(foo) should have failed!`)

  try {
    hasFailed = false
    sign([1, 2, "three"])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sign([1, 2, "three"]) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./add.js":11,"./chop.js":17,"./is-number.js":39,"./is-undefined.js":41,"./normal.js":51,"./random.js":54,"./round.js":57,"./scale.js":58,"./set.js":60,"./sort.js":66,"./vectorize.js":73}],64:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isNumber = require("./is-number.js")
let vectorize = require("./vectorize.js")

let sin = vectorize(function(x){
  assert(!isUndefined(x), "You must pass a number or an array of numbers into the `sin` function!")
  assert(isNumber(x), "You must pass a number or an array of numbers into the `sin` function!")

  return Math.sin(x)
})

module.exports = sin

// tests
if (!module.parent && typeof(window) === "undefined"){
  let min = require("./min.js")
  let max = require("./max.js")
  let range = require("./range.js")

  let x = sin(range(0, 10 * Math.PI, Math.PI / 180))
  assert(min(x) === -1 && max(x) === 1, `sin(range(0, 10 * Math.PI, Math.PI / 100)) should be in the range [-1, 1]!`)

  let hasFailed

  try {
    hasFailed = false
    sin()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sin() should have failed!`)

  try {
    hasFailed = false
    sin("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sin("foo") should have failed!`)

  try {
    hasFailed = false
    sin(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sin(true) should have failed!`)

  try {
    hasFailed = false
    sin({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sin({}) should have failed!`)

  try {
    hasFailed = false
    sin(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sin(() => {}) should have failed!`)

  try {
    let foo
    hasFailed = false
    sin(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sin(foo) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./is-number.js":39,"./is-undefined.js":41,"./max.js":45,"./min.js":48,"./range.js":55,"./vectorize.js":73}],65:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isNumber = require("./is-number.js")
let isArray = require("./is-array.js")
let range = require("./range.js")
let flatten = require("./flatten.js")
let shape = require("./shape.js")
let floor = require("./floor.js")

function slice(arr, indices){
  assert(!isUndefined(arr), "You must pass an array into the `slice` function!")
  assert(isArray(arr), "You must pass an array into the `slice` function!")

  if (isUndefined(indices)) return arr.slice()

  assert(isArray(indices), "The indices passed into the `slice` function must be a one-dimensional array of integers or null values.")

  flatten(indices).forEach(function(idx){
    assert(isUndefined(idx) || (isNumber(idx) && floor(idx) === idx), "The indices passed into the `slice` function must be a one-dimensional array of integers or null values.")
  })

  let idx = indices[0]
  if (isUndefined(idx)) idx = range(0, arr.length)
  if (isNumber(idx)) idx = [idx]

  let out = []

  idx.forEach(function(i){
    assert(i < arr.length, "Index out of bounds in the `slice` function!")
    if (i < 0) i += arr.length

    let item = arr[i]

    if (isArray(item)){
      out.push(slice(arr[i], indices.slice(1, indices.length)))
    } else {
      out.push(arr[i])
    }
  })

  // if (shape(out).indexOf(1) > -1) out = flatten(out)

  return out
}

module.exports = slice

// tests
if (!module.parent && typeof(window) === "undefined"){
  let distance = require("./distance.js")

  let x = [[2, 3, 4], [5, 6, 7], [8, 9, 10]]
  let yTrue = [[3, 6, 9]]
  let yPred = slice(x, [null, 1])

  x = [[2, 3, 4], [5, 6, 7], [8, 9, 10]]
  yTrue = [[2, 3], [8, 9]]
  yPred = slice(x, [[0, 2], [0, 1]])

  assert(distance(yTrue, yPred) === 0, `slice([[2, 3, 4], [5, 6, 7], [8, 9, 10]], [[0, 2], [0, 1]]) should be [[2, 3], [8, 9]]!`)

  x = [5, 6, 7]
  assert(slice(x, [-1])[0] === 7, `slice([5, 6, 7], [-1]) should be [7]!`)

  x = [[2, 3, 4], [5, 6, 7], [8, 9, 10]]
  yTrue = [[9]]
  yPred = slice(x, [-1, -2])
  assert(distance(yTrue, yPred) === 0, `slice([[2, 3, 4], [5, 6, 7], [8, 9, 10]], [-1, -2]) should be [9]!`)

  let hasFailed

  try {
    hasFailed = false
    slice()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `slice() should have failed!`)

  try {
    hasFailed = false
    slice([2, 3, 4], [1.5, 2.5, 3.5])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `slice([2, 3, 4], [1.5, 2.5, 3.5]) should have failed!`)

  try {
    hasFailed = false
    slice([2, 3, 4], 0)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `slice([2, 3, 4], 0) should have failed!`)

  try {
    hasFailed = false
    slice("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `slice("foo") should have failed!`)

  try {
    hasFailed = false
    slice(234)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `slice(234) should have failed!`)

  try {
    hasFailed = false
    slice({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `slice({}) should have failed!`)

  try {
    hasFailed = false
    slice(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `slice(() => {}) should have failed!`)

  try {
    let foo
    hasFailed = false
    slice(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `slice(foo) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./distance.js":28,"./flatten.js":31,"./floor.js":32,"./is-array.js":35,"./is-number.js":39,"./is-undefined.js":41,"./range.js":55,"./shape.js":61}],66:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isArray = require("./is-array.js")
let isFunction = require("./is-function.js")

function alphaSort(a, b){
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

function sort(arr, fn){
  if (isUndefined(fn)) fn = alphaSort
  assert(!isUndefined(arr), "You must pass an array into the `sort` function!")
  assert(isArray(arr), "You must pass an array into the `sort` function!")
  assert(isFunction(fn), "The second parameter of the `sort` function must be a comparison function!")

  let out = arr.slice()
  out.sort(fn)
  return out
}

module.exports = sort

// tests
if (!module.parent && typeof(window) === "undefined"){
  let shuffle = require("./shuffle.js")
  let range = require("./range.js")
  let distance = require("./distance.js")
  let normal = require("./normal.js")

  let x = shuffle(range(1, 7))
  let yTrue = range(1, 7)
  let yPred = sort(x, alphaSort)
  assert(distance(yTrue, yPred) === 0, `sort(shuffle(range(1, 7)), alphaSort) should be range(1, 7)!`)

  x = [{x: 5}, {x: 3}, {x: 10}]
  yTrue = [{x: 10}, {x: 5}, {x: 3}]
  yPred = sort(x, function(a, b){
    if (a.x < b.x) return 1
    if (a.x > b.x) return -1
    return 0
  })

  for (let i=0; i<yPred.length-1; i++){
    assert(yPred[i].x > yPred[i+1].x, "The objects should've been reverse-sorted by x-value!")
  }

  x = normal(10000)
  yPred = sort(x, alphaSort)

  for (let i=0; i<yPred.length-1; i++){
    assert(yPred[i] <= yPred[i+1], `${yPred[i]} should be less than ${yPred[i+1]}!`)
  }

  x = ["b", "c", "a", "d", "f", "e"]
  yTrue = ["a", "b", "c", "d", "e", "f"]
  yPred = sort(x, alphaSort)

  for (let i=0; i<yTrue.length; i++){
    assert(yTrue[i] === yPred[i], `sort(["b", "c", "a", "d", "f", "e"], alphaSort) should be ["a", "b", "c", "d", "e", "f"]!`)
  }

  let hasFailed

  try {
    hasFailed = false
    sort()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sort() should have failed!`)

  try {
    hasFailed = false
    sort([], [])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sort([], []) should have failed!`)

  try {
    hasFailed = false
    sort("foo", "foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sort("foo", "foo") should have failed!`)

  try {
    hasFailed = false
    sort(true, true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sort(true, true) should have failed!`)

  try {
    hasFailed = false
    sort({}, {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sort({}, {}) should have failed!`)

  try {
    let foo
    hasFailed = false
    sort(foo, foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sort(foo, foo) should have failed!`)

  try {
    let fn = () => {}
    hasFailed = false
    sort(fn, fn)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sort(fn, fn) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./distance.js":28,"./is-array.js":35,"./is-function.js":38,"./is-undefined.js":41,"./normal.js":51,"./range.js":55,"./shuffle.js":62}],67:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isNumber = require("./is-number.js")
let vectorize = require("./vectorize.js")

let sqrt = vectorize(function(x){
  assert(!isUndefined(x), "You must pass a number or an array of numbers into the `sqrt` function!")
  assert(isNumber(x), "You must pass a number or an array of numbers into the `sqrt` function!")
  assert(x >= 0, "The `sqrt` function only operates on zero or positive numbers!")

  return Math.sqrt(x)
})

module.exports = sqrt

// tests
if (!module.parent && typeof(window) === "undefined"){
  let distance = require("./distance.js")

  let x = 4
  let yTrue = 2
  let yPred = sqrt(x)
  assert(yTrue === yPred, `sqrt(4) should be 2, but instead was ${yPred}!`)

  x = [9, 4, 16]
  yTrue = [3, 2, 4]
  yPred = sqrt(x)
  assert(distance(yTrue, yPred) === 0, `sqrt([9, 4, 16]) should be [3, 2, 4]!`)

  let hasFailed

  try {
    hasFailed = false
    sqrt()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sqrt() should have failed!`)

  try {
    hasFailed = false
    sqrt("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sqrt("foo") should have failed!`)

  try {
    hasFailed = false
    sqrt(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sqrt(true) should have failed!`)

  try {
    hasFailed = false
    sqrt({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sqrt({}) should have failed!`)

  try {
    hasFailed = false
    sqrt(-4)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sqrt(-4) should have failed!`)

  try {
    hasFailed = false
    sqrt(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sqrt(() => {}) should have failed!`)

  try {
    let foo
    hasFailed = false
    sqrt(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sqrt(foo) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./distance.js":28,"./is-number.js":39,"./is-undefined.js":41,"./vectorize.js":73}],68:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isArray = require("./is-array.js")
let isNumber = require("./is-number.js")
let flatten = require("./flatten.js")
let mean = require("./mean.js")
let pow = require("./pow.js")
let sqrt = require("./sqrt.js")

function std(arr){
  assert(!isUndefined(arr), "You must pass an array of numbers into the `std` function!")
  assert(isArray(arr), "You must pass an array of numbers into the `std` function!")

  let temp = flatten(arr)
  if (temp.length === 0) return undefined

  temp.forEach(function(v){
    assert(isNumber(v), "You must pass an array of numbers into the `std` function!")
  })

  let m = mean(temp)
  let out = 0
  temp.forEach(x => out += pow(x - m, 2))
  return sqrt(out / temp.length)
}

module.exports = std

// tests
if (!module.parent && typeof(window) === "undefined"){
  let normal = require("./normal.js")
  let abs = require("./abs.js")
  let add = require("./add.js")
  let scale = require("./scale.js")

  let x = normal(10000)
  assert(abs(std(x) - 1) < 0.05, `std(normal(10000)) should be approximately 1!`)

  x = add(scale(x, 100), -250)
  assert(abs(std(x) - 100) < 5, `std(normal(10000) * 100 - 250) should be approximately 100!`)

  let hasFailed

  try {
    hasFailed = false
    std()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `std() should have failed!`)

  try {
    hasFailed = false
    std(123)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `std(123) should have failed!`)

  try {
    hasFailed = false
    std("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `std("foo") should have failed!`)

  try {
    hasFailed = false
    std(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `std(true) should have failed!`)

  try {
    hasFailed = false
    std({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `std({}) should have failed!`)

  try {
    hasFailed = false
    std(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `std(() => {}) should have failed!`)

  try {
    let foo
    hasFailed = false
    std(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `std(foo) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./abs.js":10,"./add.js":11,"./flatten.js":31,"./is-array.js":35,"./is-number.js":39,"./is-undefined.js":41,"./mean.js":46,"./normal.js":51,"./pow.js":53,"./scale.js":58,"./sqrt.js":67}],69:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isArray = require("./is-array.js")
let isNumber = require("./is-number.js")
let flatten = require("./flatten.js")

function sum(arr){
  assert(!isUndefined(arr), "You must pass an array of numbers into the `sum` function!")
  assert(isArray(arr), "You must pass an array of numbers into the `sum` function!")

  let temp = flatten(arr)

  temp.forEach(function(v){
    assert(isNumber(v), "You must pass an array of numbers into the `sum` function!")
  })

  let out = 0
  temp.forEach(v => out += v)
  return out
}

module.exports = sum

// tests
if (!module.parent && typeof(window) === "undefined"){
  let range = require("./range.js")
  let normal = require("./normal.js")
  let abs = require("./abs.js")

  let x = [2, 3, 4]
  let yTrue = 9
  let yPred = sum(x)
  assert(yTrue === yPred, `sum([2, 3, 4]) should be 9, but instead is ${yPred}!`)

  x = range(-100, 101)
  yTrue = 0
  yPred = sum(x)
  assert(yTrue === yPred, `sum(range(-100, 101)) should be 0, but instead is ${yPred}!`)

  x = []
  yTrue = 0
  yPred = sum(x)
  assert(yTrue === yPred, `sum([]) should be 0, but instead was ${yPred}!`)

  let hasFailed

  try {
    hasFailed = false
    sum()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sum() should have failed!`)

  try {
    hasFailed = false
    sum("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sum("foo") should have failed!`)

  try {
    hasFailed = false
    sum(123)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sum(123) should have failed!`)

  try {
    hasFailed = false
    sum(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sum(true) should have failed!`)

  try {
    hasFailed = false
    sum(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sum(() => {}) should have failed!`)

  try {
    hasFailed = false
    sum({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sum({}) should have failed!`)

  try {
    hasFailed = false
    sum([1, 2, "three"])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `sum([1, 2, "three"]) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./abs.js":10,"./flatten.js":31,"./is-array.js":35,"./is-number.js":39,"./is-undefined.js":41,"./normal.js":51,"./range.js":55}],70:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isNumber = require("./is-number.js")
let vectorize = require("./vectorize.js")
let floor = require("./floor.js")

let tan = vectorize(function(x){
  assert(!isUndefined(x), "You must pass a number or an array of numbers into the `tan` function!")
  assert(isNumber(x), "You must pass a number or an array of numbers into the `tan` function!")

  let k = (x - Math.PI / 2) / Math.PI
  if (k === floor(k)) return undefined
  return Math.tan(x)
})

module.exports = tan

// tests
if (!module.parent && typeof(window) === "undefined"){
  let abs = require("./abs.js")
  let normal = require("./normal.js")

  let x = Math.PI / 4
  let yTrue = 1
  let yPred = tan(x)
  assert(abs(yTrue - yPred) < 0.01, `tan(pi / 4) should be 1, but instead was ${yPred}!`)

  x = -Math.PI / 2
  yTrue = undefined
  yPred = tan(x)
  assert(yTrue === yPred, "tan(-pi / 2) should be undefined, but instead was ${yPred}!")

  x = 2 * Math.PI
  yTrue = 0
  yPred = tan(x)
  assert(abs(yTrue - yPred) < 0.01, `tan(2 * pi) should be 0, but instead was ${yPred}!`)

  let hasFailed

  try {
    hasFailed = false
    tan()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `tan() should have failed!`)

  try {
    hasFailed = false
    tan(normal(10000))
  } catch(e){
    hasFailed = true
  }

  assert(!hasFailed, `tan(normal(10000)) should not have failed!`)

  try {
    hasFailed = false
    tan("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `tan("foo") should have failed!`)

  try {
    hasFailed = false
    tan(true,)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `tan(true) should have failed!`)

  try {
    hasFailed = false
    tan({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `tan({}) should have failed!`)

  try {
    hasFailed = false
    tan(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `tan(() => {}) should have failed!`)

  try {
    let foo
    hasFailed = false
    tan(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `tan(foo) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./abs.js":10,"./floor.js":32,"./is-number.js":39,"./is-undefined.js":41,"./normal.js":51,"./vectorize.js":73}],71:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isArray = require("./is-array.js")
let shape = require("./shape.js")
let reverse = require("./reverse.js")
let ndarray = require("./ndarray.js")

function transpose(arr){
  assert(!isUndefined(arr), "You must pass an array into the `transpose` function!")
  assert(isArray(arr), "You must pass an array into the `transpose` function!")

  let theShape = shape(arr)
  assert(theShape.length <= 2, "I'm not smart enough to know how to transpose arrays that have more than 2 dimensions. Sorry for the inconvenience! Please only pass 1- or 2-dimensional arrays into the `transpose` function!")

  if (theShape.length === 1){
    return reverse(arr)
  } else if (theShape.length === 2){
    let out = ndarray(reverse(theShape))

    for (let row=0; row<theShape[0]; row++){
      for (let col=0; col<theShape[1]; col++){
        out[col][row] = arr[row][col]
      }
    }

    return out
  }
}

module.exports = transpose

// tests
if (!module.parent && typeof(window) === "undefined"){
  let isEqual = require("./is-equal.js")

  let x = [2, 3, 4]
  let yTrue = [4, 3, 2]
  let yPred = transpose(x)
  assert(isEqual(yTrue, yPred), `transpose([2, 3, 4]) should be [4, 3, 2]!`)

  x = [[2, 3, 4], [5, 6, 7], [8, 9, 10]]
  yTrue = [[2, 5, 8], [3, 6, 9], [4, 7, 10]]
  yPred = transpose(x)
  assert(isEqual(yTrue, yPred), `transpose([[2, 3, 4], [5, 6, 7], [8, 9, 10]]) should be [[2, 5, 8], [3, 6, 9], [4, 7, 10]]!`)

  x = [["a", "b", "c", "d"], ["e", "f", "g", "h"]]
  yTrue = [["a", "e"], ["b", "f"], ["c", "g"], ["d", "h"]]
  yPred = transpose(x)
  assert(isEqual(yTrue, yPred), `transpose([["a", "b", "c", "d"], ["e", "f", "g", "h"]]) should be [["a", "e"], ["b", "f"], ["c", "g"], ["d", "h"]]!`)

  let hasFailed

  try {
    hasFailed = false
    transpose()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `transpose() should have failed!`)

  try {
    hasFailed = false
    transpose([[2, 3, 4], [5, 6]])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `transpose([[2, 3, 4], [5, 6]]) should have failed!`)

  try {
    hasFailed = false
    transpose({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `transpose({}) should have failed!`)

  try {
    hasFailed = false
    transpose(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `transpose(() => {}) should have failed!`)

  try {
    hasFailed = false
    transpose("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `transpose("foo") should have failed!`)

  try {
    hasFailed = false
    transpose(234)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `transpose(234) should have failed!`)

  try {
    hasFailed = false
    transpose(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `transpose(true) should have failed!`)

  try {
    hasFailed = false
    transpose(ndarray([2, 3, 4]))
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `transpose() should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./is-array.js":35,"./is-equal.js":37,"./is-undefined.js":41,"./ndarray.js":50,"./reverse.js":56,"./shape.js":61}],72:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isArray = require("./is-array.js")
let isNumber = require("./is-number.js")
let flatten = require("./flatten.js")
let pow = require("./pow.js")
let std = require("./std.js")

function variance(arr){
  assert(!isUndefined(arr), "You must pass an array of numbers into the `variance` function!")
  assert(isArray(arr), "You must pass an array of numbers into the `std` function!")

  let temp = flatten(arr)

  temp.forEach(function(val){
    assert(isNumber(val), "You must pass an array of numbers into the `std` function!")
  })

  return pow(std(temp), 2)
}

module.exports = variance

// tests
if (!module.parent && typeof(window) === "undefined"){
  let abs = require("./abs.js")
  let normal = require("./normal.js")
  let scale = require("./scale.js")

  let x = normal(10000)
  let yTrue = 1
  let yPred = variance(x)
  assert(abs(yTrue - yPred) < 0.05, `variance(normal(10000)) should be approximately 1, but instead is ${yPred}!`)

  x = scale(normal([10, 10, 10, 10]), 2)
  yTrue = 4
  yPred = variance(x)
  assert(abs(yTrue - yPred) < 0.05, `variance(normal(10000) * 2) should be approximately 4, but instead is ${yPred}!`)

  let hasFailed

  try {
    hasFailed = false
    variance()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `variance() should have failed!`)

  try {
    hasFailed = false
    variance("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `variance("foo") should have failed!`)

  try {
    hasFailed = false
    variance(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `variance(true) should have failed!`)

  try {
    hasFailed = false
    variance(() => {})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `variance(() => {}) should have failed!`)

  try {
    hasFailed = false
    variance({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `variance({}) should have failed!`)

  try {
    let foo
    hasFailed = false
    variance(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `variance(foo) should have failed!`)

  try {
    hasFailed = false
    variance([1, 2, "three"])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `variance([1, 2, "three"]) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./abs.js":10,"./flatten.js":31,"./is-array.js":35,"./is-number.js":39,"./is-undefined.js":41,"./normal.js":51,"./pow.js":53,"./scale.js":58,"./std.js":68}],73:[function(require,module,exports){
let assert = require("../misc/assert.js")
let isUndefined = require("./is-undefined.js")
let isFunction = require("./is-function.js")
let isArray = require("./is-array.js")
let max = require("./max.js")

function vectorize(fn){
  assert(!isUndefined(fn), "You must pass a function into the `vectorize` function!")
  assert(isFunction(fn), "You must pass a function into the `vectorize` function!")

  return function temp(){
    let atLeastOneArgumentIsAnArray = (Object.keys(arguments).map(key => isArray(arguments[key])).indexOf(true) > -1)

    if (atLeastOneArgumentIsAnArray){
      let out = []
      let lengths = Object.keys(arguments).filter(key => isArray(arguments[key])).map(key => arguments[key].length)
      let maxLength = max(lengths)

      lengths.forEach(function(length){
        assert(length === maxLength, `If using arrays for all arguments to this function, then the arrays must all have equal length!`)
      })

      for (let i=0; i<maxLength; i++){
        let args = Object.keys(arguments).map(key => {
          if (isArray(arguments[key])) return arguments[key][i]
          return arguments[key]
        })
        out.push(temp(...args))
      }

      return out
    } else {
      return fn(...arguments)
    }
  }
}

module.exports = vectorize

// tests
if (!module.parent && typeof(window) === "undefined"){
  let isEqual = require("./is-equal.js")

  let x = [2, 3, 4]
  let double = vectorize(x => x * 2)
  let yTrue = [4, 6, 8]
  let yPred = double(x)
  assert(isEqual(yTrue, yPred), "double([2, 3, 4]) should be [4, 6, 8]!")

  x = [0, 1, 2, 3]
  let tens = vectorize(x => 10)
  yTrue = [10, 10, 10, 10]
  yPred = tens(x)
  assert(isEqual(yTrue, yPred), "tens([0, 1, 2, 3]) should be [10, 10, 10, 10]!")

  x = [[[[1, 2, 3, 4]]]]
  let square = vectorize(x => x * x)
  yTrue = [[[[1, 4, 9, 16]]]]
  yPred = square(x)
  assert(isEqual(yTrue, yPred), "square([[[[1, 2, 3, 4]]]]) should be [[[[1, 4, 9, 16]]]]!")

  x = ["a", "b", "c"]
  let foo = vectorize(x => x + "foo")
  yTrue = ["afoo", "bfoo", "cfoo"]
  yPred = foo(x)
  assert(isEqual(yTrue, yPred), `foo(["a", "b", "c"]) should be ["afoo", "bfoo", "cfoo"]!`)

  let hasFailed

  try {
    hasFailed = false
    vectorize()
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `vectorize() should have failed!`)

  try {
    hasFailed = false
    let add = vectorize((a, b) => a + b)
    add([2, 3, 4], [5, 6])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `add([2, 3, 4], [5, 6]) should have failed!`)

  try {
    hasFailed = false
    vectorize(123)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `vectorize(123) should have failed!`)

  try {
    hasFailed = false
    vectorize("foo")
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `vectorize("foo") should have failed!`)

  try {
    hasFailed = false
    vectorize(true)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `vectorize(true) should have failed!`)

  try {
    hasFailed = false
    vectorize({})
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `vectorize({}) should have failed!`)

  try {
    let foo
    hasFailed = false
    vectorize(foo)
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `vectorize(foo) should have failed!`)

  try {
    hasFailed = false
    vectorize([])
  } catch(e){
    hasFailed = true
  }

  assert(hasFailed, `vectorize([]) should have failed!`)

  console.log("All tests passed!")
}

},{"../misc/assert.js":78,"./is-array.js":35,"./is-equal.js":37,"./is-function.js":38,"./is-undefined.js":41,"./max.js":45}],74:[function(require,module,exports){
let ndarray = require("./ndarray.js")
let apply = require("../misc/apply.js")

function zeros(shape){
  return apply(ndarray(shape), x => 0)
}

module.exports = zeros

},{"../misc/apply.js":76,"./ndarray.js":50}],75:[function(require,module,exports){
let out = {
  apply: require("./apply.js"),
  array: require("./array.js"),
  assert: require("./assert.js"),
  downloadJSON: require("./download-json.js"),
  dump: require("./dump.js"),
  pause: require("./pause.js"),
  print: require("./print.js"),
}

module.exports = out

},{"./apply.js":76,"./array.js":77,"./assert.js":78,"./download-json.js":79,"./dump.js":80,"./pause.js":81,"./print.js":82}],76:[function(require,module,exports){
let vectorize = require("../math/vectorize.js")

let apply = vectorize(function(x, fn){
  return fn(x)
})

module.exports = apply

},{"../math/vectorize.js":73}],77:[function(require,module,exports){
Array.prototype.asyncForEach = async function(fn){
  for (let i=0; i<this.length; i++) await fn(this[i], i, this)
  return this
}

Array.prototype.alphaSort = function(key){
  return this.sort(function(a, b){
    if (key){
      if (a[key] < b[key]) return -1
      if (a[key] > b[key]) return 1
      return 0
    } else {
      if (a < b) return -1
      if (a > b) return 1
      return 0
    }
  })
}

},{}],78:[function(require,module,exports){
module.exports = function(isTrue, message){
  if (!isTrue) throw new Error(message)
}

},{}],79:[function(require,module,exports){
function downloadJSON(obj, filename){
  let a = document.createElement("a")
  a.href = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(obj, null, "\t"))}`
  a.download = filename
  a.dispatchEvent(new MouseEvent("click"))
}

module.exports = downloadJSON

},{}],80:[function(require,module,exports){
(function (global){(function (){
function dump(obj, excluded=["dump"]){
  Object.keys(obj).forEach(function(key){
    if (excluded.indexOf(key) < 0){
      global[key] = obj[key]
    }
  })
}

module.exports = dump

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],81:[function(require,module,exports){
function pause(ms){
  return new Promise(function(resolve, reject){
    try {
      return setTimeout(resolve, ms)
    } catch(e){
      return reject(e)
    }
  })
}

module.exports = pause

},{}],82:[function(require,module,exports){
let isArray = require("../math/is-array.js")
let shape = require("../math/shape.js")
let DataFrame = require("../math/classes/dataframe.js")
let Series = require("../math/classes/series.js")

function print(x){
  if (isArray(x)){
    let xShape = shape(x)

    if (xShape.length === 1){
      new DataFrame([x]).print()
    } else if (xShape.length == 2){
      new DataFrame(x).print()
    } else {
      console.log(x)
    }
  } else if (x instanceof DataFrame || x instanceof Series){
    x.print()
  } else {
    console.log(x)
  }
}

module.exports = print

},{"../math/classes/dataframe.js":20,"../math/classes/series.js":21,"../math/is-array.js":35,"../math/shape.js":61}],83:[function(require,module,exports){
const tools = require("js-math-tools")

function makeKey(keyLength, keySeed){
  tools.misc.assert(tools.math.isNumber(keyLength) && parseInt(keyLength) === keyLength, "`keyLength` must be an integer!")

  if (keySeed){
    tools.misc.assert(tools.math.isNumber(keySeed) && parseInt(keySeed) === keySeed, "`keySeed` must be an integer!")
    tools.math.seed(keySeed)
  }

  let out = ""
  let alpha = "abcdefghijklmnopqrstuvwxyz1234567890"
  for (let i=0; i<keyLength; i++) out += alpha[parseInt(tools.math.random() * alpha.length)]
  return out
}

module.exports = makeKey

},{"js-math-tools":8}],84:[function(require,module,exports){

},{}],85:[function(require,module,exports){
(function (process){(function (){
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;

}).call(this)}).call(this,require('_process'))
},{"_process":86}],86:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1]);
