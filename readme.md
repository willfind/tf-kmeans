# Intro

This is [Josh](https://github.com/jrc03c)'s little attempt to implement [_K_-means](https://en.wikipedia.org/wiki/K-means_clustering) in [Tensorflow.js](https://www.tensorflow.org/js).

# Installation

```bash
npm install --save https://github.com/willfind/tf-kmeans
```

# Usage

Load some data and split it into train and test sets:

```js
// `x` here is a matrix or 2-dimensional array
const x = loadDataSomehow()

// use 90% of the data for training
const xTrain = x.slice(0, parseInt(0.9 * x.length))

// and test on the other 10%
const xTest = x.slice(parseInt(0.9 * x.length))
```

This library offers three models: `TFKMeansNaive`, `TFKMeansPlusPlus`, and `TFKMeansMeta`. Because the first model uses the naive _K_-means algorithm, it'll run more slowly than the other models; so you should probably only use it as a last resort. The second model implements the _K_-means++ initialization algorithm and therefore performs better than the first model. However, you'd have to provide an exact _K_-value (i.e., number of clusters) to this model; so it's only useful if you already have a strong intuition about what the "right" _K_-value ought to be. The third model is probably the best one to use, then, since it tries to find the best _K_-value automatically.

To use the meta model, do:

```js
const { TFKMeansMeta } = require("@willfind/tf-kmeans")

const kmeans = new TFKMeansMeta({
  ks: [1, 2, 3, 4, 5],
  maxIterations: 100,
  numberOfFolds: 10,
})

// train on the data loaded above
kmeans.fit(xTrain)

// compute the labels for the test data
const yTest = kmeans.predict(xTest)

// or check out our score on the test data
console.log(kmeans.score(xTest))
```

Note that this library follows the sklearn convention of returning scores in such a way that higher values are always better. Sklearn's [KMeans](https://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html) model, for example, returns the _opposite_ (i.e., the negative) of the _K_-means objective. Since the _K_-means objective is the within-cluster sum of squared errors — and is therefore always a positive value — the best scores are the _lowest_ scores. So, in order to follow the sklearn scoring convention, we just multiply the score returned from the _K_-means objective function by -1 to return a negative value, which means that the best scores are now the _highest_ (i.e., least negative) scores!

We do also provide an `accuracy` scoring function in case you know labels for a data set and want to compare them against predicted labels. For example:

```js
const TFKMeans = require("@willfind/tf-kmeans")
const { TFKMeansMeta } = TFKMeans.models
const { accuracy } = TFKMeans.metrics

// load data
const x = loadDataSomehow()
const y = loadKnownLabelsForDataSomehow()

// split data into train and test sets
const xTrain = x.slice(0, parseInt(0.9 * x.length))
const xTest = x.slice(parseInt(0.9 * x.length))
const yTrain = y.slice(0, parseInt(0.9 * y.length))
const yTest = y.slice(parseInt(0.9 * y.length))

// train the model
const kmeans = new TFKMeansMeta({
  ks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  maxIterations: 100,
  numberOfFolds: 10,
})

kmeans.fit(xTrain)

// get predictions
const yPred = kmeans.predict(xTest)

// compute accuracy score
console.log(accuracy(yTest, yPred))
```

# API

he API is virtually identical across the three classes. The main differences appear in the constructor functions. But the `fit`, `predict`, and `score` methods, as well as the `centroids` property, should work the same way in all three classes.

### `(TFKMeansNaive || TFKMeansPlusPlus)(config)`

The constructor for the base models takes a configuration object argument. The only required property in this object is `k`, the number of cluster centers (AKA centroids). Optional properties include:

- `maxRestarts` = the number of times that the algorithm is allowed to start over with new a new batch of centroids; the default value is 25
- `maxIterations` = the number of times within a single restart that the algorithm is allowed to update the centroids' positions; the default value is 100
- `tolerance` = the update distance threshold below which the algorithm stops iterating; the update distance is the Euclidean distance between one iteration's centroid positions and the next iteration's centroid positions, so if the update is sufficiently small, then we consider the algorithm to have converged and thus stop iterating; the default value is 1e-4

These four values all become properties of the model instance (keeping their same names).

### `TFKMeansMeta(config)`

The constructor for the meta model takes a configuration object argument. There are no required properties for this object. Optional properties include:

- `ks` = the _K_-values to test; the default value is the range `[1, 16)`
- `maxRestarts` = the number of restarts to pass into the constructor of the final fitted model (after finding the best _K_)
- `maxIterations` = the number of iterations to pass into the constructor of the final fitted model (after finding the best _K_)
- `tolerance` = the update distance threshold to pass into the constructor of the final fitted model (after finding the best _K_)
- `modelClass` = the class definition to use during the fitting process; the default value is the `TFKMeansPlusPlus` class

### `(TFKMeansPlusPlus || TFKMeansMeta).fit(x, progress)`

Fits the model to the two-dimensional data, `x`. Optionally, a `progress` callback function can be provided. This function takes a single argument that represents the overall completion of the `fit` method (in terms of restarts and iterations) expressed as a fraction between 0 and 1.

### `(TFKMeansPlusPlus || TFKMeansMeta).predict(x, centroids)`

Returns the labels for each point in `x`. A label is an index into the model's `centroids` array. Optionally, an alternative set of `centroids` can be supplied as the second argument.

### `(TFKMeansPlusPlus || TFKMeansMeta).score(x, centroids)`

Returns the negative of the _K_-means objective. The _K_-means objective is the within-cluster sum of squared errors; so the `score` method returns the negative of that value (so that higher scores are better than lower scores). See the note at the start of this section for more info.

### `(TFKMeansPlusPlus || TFKMeansMeta).centroids`

The array of learned centroids. It's only available after the `fit` method has been run.

# To do

- Come up with a more principled `errorRatio` parameter for the `TFKMeansMeta` model and/or consider [the "silhouette" analysis method](https://scikit-learn.org/stable/auto_examples/cluster/plot_kmeans_silhouette_analysis.html) for determining the best _K_-value.
