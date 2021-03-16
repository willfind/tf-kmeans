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

  return sum(pow(subtract(aTemp, bTemp), 2)) / aTemp.length
}

module.exports = missingAwareDistance
