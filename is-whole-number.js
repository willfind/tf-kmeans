function isWholeNumber(x){
  return isNumber(x) && parseInt(x) === x && x >= 0
}

module.exports = isWholeNumber
