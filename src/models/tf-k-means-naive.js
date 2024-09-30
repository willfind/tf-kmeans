const {
  add,
  assert,
  float,
  isDataFrame,
  isFunction,
  isUndefined,
  normal,
  random,
  scale,
  shape,
} = require("@jrc03c/js-math-tools")

const { isMatrix, isTFTensor } = require("../helpers.js")
const { KMeansNaive } = require("@jrc03c/js-data-science-helpers").KMeans
const { sse } = require("../metrics")
const pause = require("@jrc03c/pause")
const tf = require("@tensorflow/tfjs")

class TFKMeansNaive extends KMeansNaive {
  initializeCentroids(x) {
    if (isDataFrame(x)) {
      x = x.values
    }

    if (isTFTensor(x)) {
      x = x.arraySync()
    }

    return tf.tensor(super.initializeCentroids(float(x)))
  }

  getFitStepFunction(x, progress) {
    if (isDataFrame(x)) {
      x = x.values
    }

    if (isTFTensor(x)) {
      x = x.arraySync()
    }

    x = float(x)

    assert(isMatrix(x), "`x` must be a matrix!")

    if (!isUndefined(progress)) {
      assert(isFunction(progress), "If defined, `progress` must be a function!")
    }

    const tensors = []

    const addTensorToScope = x => {
      tensors.push(x)
      return x
    }

    const xtf = addTensorToScope(tf.tensor(x))
    const centroids = addTensorToScope(this.initializeCentroids(x))

    let state = {
      currentRestart: 0,
      currentIteration: 0,
      currentCentroids: centroids,
      bestCentroids: centroids,
      bestScore: -Infinity,
      isFinished: false,
    }

    return async () => {
      try {
        // label data points
        const labels = this.predict(xtf, state.currentCentroids)
        const currentCentroids = state.currentCentroids.arraySync()

        // adjust centroids
        let temp = []

        for (let i = 0; i < this.k; i++) {
          const indices = []

          labels.forEach((label, j) => {
            if (label === i) indices.push(j)
          })

          if (indices.length === 0) {
            temp.push(
              add(
                currentCentroids[
                  Math.floor(random() * currentCentroids.length)
                ],
                scale(0.01, normal(x[0].length))
              )
            )
          } else {
            const cluster = addTensorToScope(xtf.gather(indices))
            temp.push(addTensorToScope(cluster.mean(0)))
          }
        }

        temp = addTensorToScope(tf.stack(temp))

        // if has converged, finish iterations early
        const d = sse(state.currentCentroids, temp)

        if (d < this.tolerance) {
          state.currentIteration = this.maxIterations - 1
        }

        state.currentIteration++

        if (state.currentIteration >= this.maxIterations) {
          state.currentRestart++

          const score = this.score(xtf, temp)

          if (score > state.bestScore) {
            state.bestScore = score
            state.bestCentroids = addTensorToScope(temp.clone())
          }

          state.currentIteration = 0

          if (state.currentRestart >= this.maxRestarts) {
            state.isFinished = true
          } else {
            state.currentCentroids = addTensorToScope(
              this.initializeCentroids(x)
            )
          }
        } else {
          state.currentCentroids = addTensorToScope(temp.clone())
        }

        if (state.isFinished) {
          this.centroids = state.bestCentroids.arraySync()
          state = { isFinished: true }

          tensors.forEach(t => {
            try {
              t.dispose()
            } catch (e) {}
          })

          if (progress) {
            progress(1, this)
            await pause(0)
          }
        } else {
          this.centroids = state.currentCentroids.arraySync()

          if (progress) {
            progress(
              (state.currentRestart +
                state.currentIteration / this.maxIterations) /
                this.maxRestarts,
              this
            )

            await pause(0)
          }
        }

        return state
      } catch (e) {
        tensors.forEach(t => {
          try {
            t.dispose()
          } catch (e) {}
        })

        throw e
      }
    }
  }

  async fit(x, progress) {
    const fitStep = this.getFitStepFunction(x, progress)
    let state

    while (!state || !state.isFinished) {
      state = await fitStep()
    }

    return this
  }

  predict(x, centroids) {
    // This function was a little hard for me to wrap my head around both as I
    // was writing it for the first time and now as I'm coming back to improve
    // the unit tests and documentation. But I think the way I must've been
    // thinking about it before must've been something like the following.
    //
    // A prediction in the context of k-means about a particular data point is
    // the centroid to which that point is closest. We could find this solution
    // iteratively (i.e., loop over all the data points, and for each point,
    // loop over all the centroids and find which one is closest, etc.), but
    // that takes a REALLY long time. However, it's possible to do all of that
    // in a few matrix operations. But that's where things get tricky (at least
    // for me). If we put all of the centroids into an array such that `c`, the
    // array of centroids, is a matrix, then we can do `p - c`, where `p` is an
    // individual data point. The result is `d`, an array of vectors pointing
    // from `p` to each of the centroids in `c`. If we square all of the values
    // in `d` and then sum up the values in each row, we get an array of
    // squared distances. Getting the index of the minimum distance allows us
    // to select the closest centroid from `c`. Note that what's returned in
    // this specific implementation is the *label* (or index), not the centroid
    // itself — though that can be easily fetched once we have the label.
    //
    // The above makes sense to me for a single data point, but how do we do
    // this across many data points without iteration? Well, we need to
    // modify our data (`x`) and centroid (`c`) matrices such that the
    // subtraction `x - c` forces EACH data point in `x` to subtract ALL of the
    // centroids in `c`. By inserting an extra dimension each into `x` and `c`
    // (but not in the same place) will create a situation where the
    // broadcasting rules accomplish what I described in the previous sentence.
    // For `x`, the extra dimension is inserted between the 1st and 2nd
    // dimensions (i.e., between its rows and columns). For `c`, the extra
    // dimension is inserted before the 1st dimension (i.e., before the rows).
    // So, if `x` originally had 100 data points with 5 features and thus a
    // shape of (100, 5), then its modified version will have a shape of
    // (100, 1, 5). What this means for `x` is that each row now only has 1
    // value; but that value is an array of 5 (feature) values. Or, in other
    // words, each row in `x` contains a MATRIX of shape (1, 5). Similarly, if
    // `c` originally contained 7 centroids, each with 5 features, and thus a
    // shape of (7, 5), then its modified version will have a shape of
    // (1, 7, 5). What this means for `c` is that it now only has 1 row; but
    // that one row contains the original matrix `c`!
    //
    // So now, when we do `x - c`, each row in `x` is compared with each row in
    // `c`; but now a "row" in `x` is a 1x5 matrix, and a "row" in `c` is the
    // centroids matrix. This is analogous to the beginning when we subtracted
    // `c` from an individual data point except that the individual data point
    // has been reshaped into a matrix rather than remaining as a vector.
    //
    // We're almost done! If `x` has a shape of (100, 1, 5) and `c` has a shape
    // of (1, 7, 5), then the `x - c` will produce a difference matrix, `d`
    // with a shape of (100, 7, 5). In other words, for each row in `d`, there
    // exists a 7x5 matrix; and that matrix represents the distances between
    // centroids and the data point that original sat in that row.
    //
    // Finally, if we square all of the values in `d` and then sum along the
    // last axis (effectively collapsing that axis), then we end up with a
    // matrix of shape (100, 7), which represents each data point's distances
    // to each of the 7 centroids. Then, if we take the argmin of each row
    // (effectively collapsing that row), then we end up finally with a vector
    // representing the labels for each of the 100 data points! Whew!

    return tf.tidy(() => {
      if (isTFTensor(x)) {
        x = x.arraySync()
      }

      if (isDataFrame(x)) {
        x = x.values
      }

      x = float(x)

      assert(isMatrix(x), "`x` must be a matrix!")

      centroids = centroids || this.centroids

      if (!isTFTensor(centroids)) {
        centroids = tf.tensor(centroids)
      }

      assert(
        shape(x)[1] === centroids.shape[1],
        "`x` and `centroids` must have the same number of columns!"
      )

      const xtf = tf.tensor(x).expandDims(1)
      const ctf = centroids.expandDims(0)
      return xtf.sub(ctf).pow(2).sum(2).argMin(1).arraySync()
    })
  }

  score(x, centroids) {
    // https://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html
    // NOTE: Like sklearn's KMeans model, this model returns the *opposite*
    // (i.e., the negative) of the k-means objective. The objective is the sum
    // of squared distances between the points and their assigned centroids.
    // So, the opposite value is a negative number, which means that *higher*
    // scores are better! (That's a convention that sklearn follows for all of
    // its models, I believe.)

    return tf.tidy(() => {
      if (isTFTensor(x)) {
        x = x.arraySync()
      }

      if (isDataFrame(x)) {
        x = x.values
      }

      x = float(x)

      assert(isMatrix(x), "`x` must be a matrix!")

      centroids = centroids || this.centroids

      if (!isTFTensor(centroids)) {
        centroids = tf.tensor(centroids)
      }

      assert(
        isMatrix(centroids) || isUndefined(centroids),
        "`centroids` must be a matrix or undefined!"
      )

      assert(
        shape(x)[1] === centroids.shape[1],
        "`x` and `centroids` must have the same number of columns!"
      )

      const xtf = tf.tensor(x)
      const labels = this.predict(xtf, centroids)
      const assignments = centroids.gather(labels).arraySync()

      return -sse(xtf, assignments)
    })
  }
}

module.exports = TFKMeansNaive
