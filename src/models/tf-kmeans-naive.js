const {
  add,
  assert,
  isDataFrame,
  isUndefined,
  normal,
  random,
  scale,
  shape,
} = require("@jrc03c/js-math-tools")

const { isMatrix, isTFTensor, tf } = require("../helpers.js")
const { KMeansNaive } = require("@jrc03c/js-data-science-helpers").KMeans
const { sse } = require("../metrics")

class TFKMeansNaive extends KMeansNaive {
  initializeCentroids(x) {
    return tf.tidy(() => {
      return tf.tensor(super.initializeCentroids(x))
    })
  }

  fit(x, progress) {
    // Question: Can the restarts be run in parallel? I don't think the
    // iterations can because each next iteration relies on the results of the
    // previous iteration. But restarts are completely independent from each
    // other, so they can perhaps be run in parallel...

    const self = this

    assert(isMatrix(x), "`x` must be a matrix!")

    if (isDataFrame(x)) {
      x = x.values
    }

    if (isTFTensor(x)) {
      x = x.arraySync()
    }

    assert(
      typeof progress === "function" || isUndefined(progress),
      "`progress` must be undefined or a function!"
    )

    return tf.tidy(() => {
      const xtf = tf.tensor(x)
      let bestScore = -Infinity
      let bestCentroids

      for (let restart = 0; restart < self.maxRestarts; restart++) {
        // initialize centroids
        let centroids = self.initializeCentroids(x)

        // fit centroids
        for (let iteration = 0; iteration < self.maxIterations; iteration++) {
          if (progress) {
            progress(
              (restart + iteration / self.maxIterations) / self.maxRestarts
            )
          }

          // label data points
          const labels = self.predict(xtf, centroids)

          // adjust centroids
          let temp = []

          for (let i = 0; i < self.k; i++) {
            const indices = []

            labels.forEach((label, j) => {
              if (label === i) indices.push(j)
            })

            if (indices.length === 0) {
              const getRandom = x => x[parseInt(random() * x.length)]

              temp.push(
                add(
                  getRandom(centroids.arraySync()),
                  scale(0.01, normal(x[0].length))
                )
              )
            } else {
              temp.push(xtf.gather(indices).mean(0))
            }
          }

          temp = tf.stack(temp)

          // exit early if converges...
          const d = sse(centroids, temp)
          if (d < self.tolerance) break
          centroids = temp.clone()
        }

        // score
        const score = self.score(xtf, centroids)

        if (score > bestScore) {
          bestScore = score
          bestCentroids = centroids
        }
      }

      // save best centroids
      self.centroids = bestCentroids.arraySync()
      return self
    })
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

    const self = this

    if (isTFTensor(x)) {
      x = x.arraySync()
    }

    if (isDataFrame(x)) {
      x = x.values
    }

    assert(isMatrix(x), "`x` must be a matrix!")

    centroids = centroids || self.centroids

    if (isTFTensor(centroids)) {
      centroids = centroids.arraySync()
    }

    assert(
      isMatrix(centroids) || isUndefined(centroids),
      "`centroids` must be a matrix or undefined!"
    )

    assert(
      shape(x)[1] === shape(centroids)[1],
      "`x` and `centroids` must have the same number of columns!"
    )

    return tf.tidy(() => {
      const xtf = tf.tensor(x).expandDims(1)
      const ctf = tf.tensor(centroids).expandDims(0)
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

    const self = this

    if (isTFTensor(x)) {
      x = x.arraySync()
    }

    if (isDataFrame(x)) {
      x = x.values
    }

    assert(isMatrix(x), "`x` must be a matrix!")

    centroids = centroids || self.centroids

    if (isTFTensor(centroids)) {
      centroids = centroids.arraySync()
    }

    assert(
      isMatrix(centroids) || isUndefined(centroids),
      "`centroids` must be a matrix or undefined!"
    )

    assert(
      shape(x)[1] === shape(centroids)[1],
      "`x` and `centroids` must have the same number of columns!"
    )

    return tf.tidy(() => {
      const xtf = tf.tensor(x)
      const ctf = tf.tensor(centroids)

      const assignments = tf.tidy(() => {
        const labels = self.predict(xtf, ctf)
        return ctf.gather(labels).arraySync()
      })

      return -sse(xtf, assignments)
    })
  }
}

module.exports = TFKMeansNaive