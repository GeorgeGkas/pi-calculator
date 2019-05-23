/**
 * @author George Gkasdrogkas <dai17058@uom.edu.gr>
 * @license MIT
 *
 * Based on Monte Carlo method for calculate PI.
 */
const os = require('os')

/**
 * Used to find the difference from the estimated PI.
 */
const realPI = 3.1415924535897932384646433832795027841971693993873058

/**
 * How many points should we generate per thread?
 * Note: This is a single thread version. Rather than
 *       assigning each calculation into a distinct thread,
 *       we run them sequentially.
 *       We keep the same structure as the multi thread version
 *       to point the differences between the two.
 */
const pointsPerThread = 1e8

/**
 * Get the total amount of points that exist within the circle.
 */
function getInCirclePoints(pointsPerThread) {
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
 * Start the timer.
 * Used as a lazy benchmark tool.
 */
console.time()

/**
 * Get the total amount of in circle points.
 * `os.cpus()` is used to run the `getInCirclePoints` function
 * exactly the same amount of times as in multi threaded version.
 */
const pointsInCircle = os
  .cpus()
  .reduce(
    previousPointsInCircle =>
      previousPointsInCircle + getInCirclePoints(pointsPerThread),
    0,
  )

/**
 * Estimate the PI using Monte Carlo method.
 */
const estimatedPI = (4 * pointsInCircle) / (pointsPerThread * os.cpus().length)

/**
 * Stop the timer.
 * This also prints the execution time in console.
 */
console.timeEnd()

/**
 * Print results from the PI calculation.
 */
console.log('Estimated PI: ' + estimatedPI.toPrecision(60))
console.log(
  'Difference from real PI: ' + (realPI - estimatedPI).toPrecision(60),
)
