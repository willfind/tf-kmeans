function isMatrix(x){
  return isArray(x) && shape(x).length === 2
}

module.exports = isMatrix
