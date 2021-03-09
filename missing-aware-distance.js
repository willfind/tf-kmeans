function missingAwareDistance(a, b){
  assert(isArray(a), "`a` must be an array!")
  assert(isArray(b), "`b` must be an array!")
  assert(isEqual(shape(a), shape(b)), "`a` and `b` must have the same shape!")

  let aTemp = flatten(a)
  let bTemp = flatten(b)
  let df = new DataFrame({aTemp, bTemp}).dropMissing()
  aTemp = df.get(null, "aTemp").values
  bTemp = df.get(null, "bTemp").values
  return distance(aTemp, bTemp)
}

module.exports = missingAwareDistance
