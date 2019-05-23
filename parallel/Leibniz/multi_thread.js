/**
 * @author George Gkasdrogkas <dai17058@uom.edu.gr>
 * @license MIT
 *
 * Based on Leibniz formula for π.
 * Splits the series calculations into chunks and assign each one to
 * a distinct thread. The number of Worker Threads created is defined
 * by the number of physical cores the current CPU has.
 */
const os = require('os')
const path = require('path')
const { Worker } = require('worker_threads')

/**
 * Save the references of the workers.
 */
const threadPool = new Set()

/**
 * Used to find the difference from the estimated PI.
 */
const realPI = 3.1415924535897932384646433832795027841971693993873058

/**
 * Get the number of physical CPU cores.
 */
const cpus = os.cpus().length

/**
 * We split the summation into chunks and assign each chunk
 * to a distinct thread.
 */
const chunksPerThread = 1e9

/**
 * What is the upper limit of the summation?
 */
const totalChunksSize = chunksPerThread * cpus

let summationResult = 0

/**
 * Start the timer.
 * Used as a lazy benchmark tool.
 */
console.time()

/**
 * Get the summation result.
 * Run each chunk calculation into each own Worker Thread.
 */
for (
  let currentChunkIndex = 0;
  currentChunkIndex < totalChunksSize;
  currentChunkIndex += chunksPerThread
) {
  threadPool.add(
    new Worker(path.join(__dirname, 'worker.js'), {
      workerData: { currentChunkIndex, chunksPerThread },
    }),
  )
}

/**
 * Add the appropriate event listeners on each Worker.
 */
threadPool.forEach(worker => {
  /**
   * Listen for errors.
   */
  worker.on('error', err => {
    throw err
  })

  /**
   * Upon successfully worker termination:
   */
  worker.on('exit', () => {
    /**
     * Remove Worker from thread pool.
     */
    threadPool.delete(worker)

    /**
     * Check if there are any Workers left.
     */

    if (threadPool.size === 0) {
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
    }
  })

  /**
   * When the worker calculates the chunk,
   * get the result and increase the total value of
   * the summation.
   */
  worker.on('message', chunk => {
    summationResult += chunk
  })
})
