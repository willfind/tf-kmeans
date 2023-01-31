const Bee = require("@jrc03c/bee")

const progress = document.getElementsByTagName("progress")[0]
const queen = new Bee.Queen()
queen.addDrone("tests-worker-bundle.js")
queen.command("start-tests")

const interval = setInterval(() => {
  queen.command("get-progress").then(p => {
    if (!p) return
    p = parseFloat(p.toFixed(2))
    progress.value = p * 100
    progress.innerHTML = p * 100 + "%"

    if (p >= 1) {
      clearInterval(interval)

      queen.command("get-results").then(results => {
        console.log(results)
      })
    }
  })
}, 100)
