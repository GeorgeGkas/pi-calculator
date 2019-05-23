/**
 * @author George Gkasdrogkas <dai17058@uom.edu.gr>
 * @license MIT
 * Code adapted from https://codereview.stackexchange.com/a/215903
 *
 * Based on Leibniz formula for π.
 * Calculate a chunk of the series.
 */
const { parentPort, workerData } = require('worker_threads')

/**
 * Calculate a chunk of the summation.
 * See https://en.wikipedia.org/wiki/Leibniz_formula_for_%CF%80#Convergence
 */
function calcSummationChunk({ currentChunkIndex, chunksPerThread }) {
  let temp = 0
  for (i = 0; i < chunksPerThread; i += 1) {
    temp +=
      2 /
      ((4 * (currentChunkIndex + i) + 1) * (4 * (currentChunkIndex + i) + 3))
  }

  return temp
}

const chunk = calcSummationChunk(workerData)
parentPort.postMessage(chunk)
