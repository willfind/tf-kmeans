const Bee = require("@jrc03c/bee")

const progress = document.getElementsByTagName("progress")[0]
const queen = new Bee.Queen()
queen.addDrone("tests-worker-bundle.js")
queen.command("start-tests")

let isWorking = false

const interval = setInterval(() => {
  if (isWorking) return
  isWorking = true

  queen.command("get-progress").then(p => {
    if (!p) return
    p = parseFloat(p.toFixed(2))
    progress.value = p * 100
    progress.innerHTML = p * 100 + "%"

    if (p >= 1) {
      console.log("done! requesting results...")
      clearInterval(interval)

      return queen.command("get-results").then(results => {
        console.log(results)
      })
    }

    isWorking = false
  })
}, 100)
