const subtract = (a, b) => add(a, scale(b, -1))

function missingAwareDistance(a, b){
  let nonMissingCount = 0
  let out = 0

  for (let i=0; i<a.length; i++){
    let aValue = a[i]
    let bValue = b[i]

    if (!isUndefined(aValue) && !isUndefined(bValue)){
      out += pow(aValue - bValue, 2)
      nonMissingCount++
    }
  }

  return out / nonMissingCount
}

module.exports = missingAwareDistance
