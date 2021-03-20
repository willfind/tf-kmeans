require("js-math-tools").dump()
global.tf = require("@tensorflow/tfjs")
let helpers = require("./helpers.js")

Object.keys(helpers).forEach(key => {
  global[key] = helpers[key]
})
