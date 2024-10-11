import {
  isMatrix,
  isTFTensor,
  isWholeNumber,
  orderCentroids,
  sign,
} from "./helpers.mjs"

import { sse, accuracy, rSquared, rScore } from "./metrics.mjs"

import {
  TFKMeansMeta,
  TFKMeansNaive,
  TFKMeansPlusPlus,
} from "./models/index.mjs"

const helpers = {
  isMatrix,
  isTFTensor,
  isWholeNumber,
  orderCentroids,
  sign,
}

const metrics = {
  sse,
  accuracy,
  rSquared,
  rScore,
}

const models = {
  TFKMeansMeta,
  TFKMeansNaive,
  TFKMeansPlusPlus,
}

const TFKMeans = {
  helpers,
  metrics,
  models,
}

if (typeof window !== "undefined") {
  window.TFKMeans = TFKMeans
}

export { helpers, metrics, models }
