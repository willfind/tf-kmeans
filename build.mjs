import { execSync } from "node:child_process"
import { watch } from "@jrc03c/watch"
import process from "node:process"

function rebuild() {
  console.log("-----")
  console.log(`\nRebuilding... (${new Date().toLocaleString()})`)

  try {
    const baseCommand = "npx esbuild src/index.mjs --bundle"

    const commands = [
      `${baseCommand} --platform=node --outfile=dist/tf-k-means.require.cjs`,
      `${baseCommand} --platform=node --outfile=dist/tf-k-means.require.min.cjs --minify`,
      `${baseCommand} --format=esm --outfile=dist/tf-k-means.import.mjs`,
      `${baseCommand} --format=esm --outfile=dist/tf-k-means.import.min.mjs --minify`,
      `${baseCommand} --outfile=dist/tf-k-means.standalone.cjs`,
      `${baseCommand} --outfile=dist/tf-k-means.standalone.min.cjs --minify`,

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
