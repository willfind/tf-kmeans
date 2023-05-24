const { execSync } = require("child_process")
const process = require("process")
const watch = require("@jrc03c/watch")

function rebuild() {
  console.log("-----")
  console.log(`Rebuilding... (${new Date().toLocaleString()})`)

  try {
    execSync(
      "esbuild src/index.js --bundle --outfile=dist/tf-kmeans.js --minify",
      { encoding: "utf8" }
    )

    execSync(
      "esbuild tests/browser/src/tests.js --bundle --outfile=tests/browser/tests-bundle.js",
      { encoding: "utf8" }
    )

    execSync(
      "esbuild tests/browser/src/tests-worker.js --bundle --outfile=tests/browser/tests-worker-bundle.js",
      { encoding: "utf8" }
    )

    console.log("\nDone! 🎉\n")
  } catch (e) {
    console.error(e)
  }
}

if (process.argv.indexOf("--watch") > -1) {
  watch({
    target: ".",
    exclude: [
      "node_modules",
      "dist",
      "tests-bundle.js",
      "tests-worker-bundle.js",
    ],
    created: rebuild,
    modified: rebuild,
    deleted: rebuild,
  })
}

rebuild()
