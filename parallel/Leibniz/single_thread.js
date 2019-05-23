/**
 * @author Georgios Gkasdrogkas <dai17058@uom.edu.gr>
 * @license MIT
 *
 * Based on Leibniz formula for π.
 * Splits the series calculations into chunks.
 * Run each chunk procedurally.
 */
const os = require('os')

/**
 * Used to find the difference from the estimated PI.
 */
const realPI = 3.1415924535897932384646433832795027841971693993873058

/**
 * Number of physical CPU cores.
 */
const cpus = os.cpus().length

/**
 * We split the summation into chunks and assign each chunk
 * to a distinct thread.
 * Note: This is a single thread version. Rather than
 *       assigning each chunk into a distinct thread,
 *       we run them sequentially.
 *       We keep the same structure as the multi thread version
 *       to point the differences between the two.
 */
const chunksPerThread = 1e9

/**
 * What is the upper limit of the summation?
 */
const totalChunksSize = chunksPerThread * cpus

/**
 * Calculate a chunk of the summation.
 * See https://en.wikipedia.org/wiki/Leibniz_formula_for_%CF%80#Convergence
 *
 */
function calcSummationChunk(currentChunkIndex, chunksPerThread) {
  let temp = 0
  for (i = 0; i < chunksPerThread; i += 1) {
    temp +=
      2 /
      ((4 * (currentChunkIndex + i) + 1) * (4 * (currentChunkIndex + i) + 3))
  }

  return temp
}

/**
 * Start the timer.
 * Used as a lazy benchmark tool.
 */
console.time()
let summationResult = 0

/**
 * Get the summation result.
 */
for (
  let currentChunkIndex = 0;
  currentChunkIndex < totalChunksSize;
  currentChunkIndex += chunksPerThread
) {
  summationResult += calcSummationChunk(currentChunkIndex, chunksPerThread)
}

/**
 * Estimate the PI.
 */
const estimatedPI = 4 * summationResult

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
