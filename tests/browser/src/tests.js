const Bee = require("@jrc03c/bee")

const progress = document.getElementsByTagName("progress")[0]
const queen = new Bee.Queen()
queen.addDrone("tests-worker-bundle.js")
queen.command("start-tests")

const interval = setInterval(async () => {
  const p = await queen.command("get-progress")
  progress.value = p * 100
  progress.innerHTML = p * 100 + "%"

  if (p >= 1) {
    clearInterval(interval)
    const results = await queen.command("get-results")
    console.log(results)
  }
}, 100)
