const io = require('socket.io')(8080)

/**
 * Register a new namespace.
 * Do not overlap with default namespace,
 * in case other socket is using it.
 */
const piNamespace = '/pi-job'

/**
 * Used to find the difference from the estimated PI.
 */
const realPI = 3.1415924535897932384646433832795027841971693993873058

/**
 * How many points to calculate per client.
 */
const pointsPerClient = 1e8

/**
 * The number of clients that we split
 * the calculations.
 */
const targetConnectedClients = 2

/**
 * The current number of connected clients.
 */
let connectedClients = 0

/**
 * Number o clients that received a job and
 * not finished yet.
 */
let jobsPending = 0

/**
 * Total amount of points in circle.
 * (Used in Monte Carlo method.)
 */
let pointsInCircle = 0

/**
 * Save the clients for later use.
 */
const clients = new Set()

/**
 * Upon receiving a new connection from a client:
 */
io.of(piNamespace).on('connection', socket => {
  /**
   * Increase the number of connected clients
   * and add the current clients into `clients` set.
   */
  connectedClients += 1
  clients.add(socket)

  /**
   * If the total connected clients reached the goal:
   */
  if (connectedClients === targetConnectedClients) {
    for (const client of clients) {
      /**
       * For each client assign a job.
       */
      client.emit('pi-job', { pointsPerClient })
      jobsPending += 1
    }
  }

  /**
   * Upon job completion from a client:
   */
  socket.on('data', ({ incircle }) => {
    /**
     * Decrease the pending jobs and
     * terminate the client connection.
     */
    jobsPending -= 1
    socket.emit('close')

    /**
     * When the client calculates the in circle points,
     * get the result and increase the total amount of
     * in circle points.
     */
    pointsInCircle += incircle

    /**
     * If all the clients finished their jobs,
     * estimate the PI and close the server.
     */
    if (jobsPending === 0) {
      /**
       * Estimate the PI using Monte Carlo method.
       */
      const estimatedPI =
        (4 * pointsInCircle) / (pointsPerClient * targetConnectedClients)

      /**
       * Print results from the PI calculation.
       */
      console.log('Estimated PI: ' + estimatedPI.toPrecision(60))
      console.log(
        'Difference from real PI: ' + (realPI - estimatedPI).toPrecision(60),
      )

      /**
       * Close the server.
       */
      io.close()
    }
  })
})
