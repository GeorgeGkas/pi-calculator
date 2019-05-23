/**
 * @author George Gkasdrogkas <dai17058@uom.edu.gr>
 * @license MIT
 *
 * Based on Monte Carlo method for calculate PI.
 */
const os = require('os')
const path = require('path')
const { Worker } = require('worker_threads')

/**
 * Used to find the difference from the estimated PI.
 */
const realPI = 3.1415924535897932384646433832795027841971693993873058

/**
 * Total amount of points in circle.
 */
let pointsInCircle = 0

/**
 * How many points should we generate in each thread?
 */
const pointsPerThread = 1e8

/**
 * Start the timer.
 * Used as a lazy benchmark tool.
 */
console.time()

/**
 * For each physical core:
 */
os.cpus()

  /**
   * Register a new Worker Thread.
   */
  .map(
    () =>
      new Worker(path.join(__dirname, 'worker.js'), {
        workerData: { pointsPerThread },
      }),
  )

  /**
   * For each of the registered Worker Threads:
   */
  .forEach((worker, _, threadPool) => {
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
       * Check if there are any Workers left.
       */
      if (threadPool.every(worker => worker.threadId < 0)) {
        /**
         * Estimate the PI using Monte Carlo method.
         */
        const estimatedPI =
          (4 * pointsInCircle) / (pointsPerThread * os.cpus().length)

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
     * When the worker calculates the in circle points,
     * get the result and increase the total amount of
     * in circle points.
     */
    worker.on('message', incircle => {
      pointsInCircle += incircle
    })
  })
