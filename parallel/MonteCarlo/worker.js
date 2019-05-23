/**
 * @author George Gkasdrogkas <dai17058@uom.edu.gr>
 * @license MIT
 *
 * Based on Monte Carlo method for calculate PI.
 */
const { parentPort, workerData } = require('worker_threads')

/**
 * Get the total amount of points that exist within the circle.
 */
function getInCirclePoints({ pointsPerThread }) {
  let incircle = 0

  for (let i = 0; i < pointsPerThread; i += 1) {
    const x = Math.random()
    const y = Math.random()

    if (Math.sqrt(x * x + y * y) < 1) {
      incircle += 1
    }
  }

  return incircle
}

/**
 * Calculate the total amount of in circle points
 * and return the result to parent thread.
 */
const incircle = getInCirclePoints(workerData)
parentPort.postMessage(incircle)
