import { execSync } from "node:child_process"
import { watch } from "@jrc03c/watch"
import process from "node:process"

function rebuild() {
  console.log("-----")
  console.log(`\nRebuilding... (${new Date().toLocaleString()})`)

  try {
    const baseCommand = "npx esbuild src/index.mjs --bundle"

    const commands = [
      "mkdir -p dist",
      "rm -rf dist/*",
      `${baseCommand} --platform=node --outfile=dist/tf-kmeans.require.cjs`,
      `${baseCommand} --platform=node --outfile=dist/tf-kmeans.require.min.cjs --minify`,
      `${baseCommand} --format=esm --outfile=dist/tf-kmeans.import.mjs`,
      `${baseCommand} --format=esm --outfile=dist/tf-kmeans.import.min.mjs --minify`,
      `${baseCommand} --outfile=dist/tf-kmeans.standalone.cjs`,
      `${baseCommand} --outfile=dist/tf-kmeans.standalone.min.cjs --minify`,

      // build test bundles
      `npx esbuild tests/browser/src/tests-worker.mjs --bundle --outfile=tests/browser/tests-worker-bundle.js`,
      `npx esbuild tests/browser/src/tests.mjs --bundle --outfile=tests/browser/tests-bundle.js`,
    ]

    commands.forEach(command => {
      execSync(command, { encoding: "utf8" })
    })

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
