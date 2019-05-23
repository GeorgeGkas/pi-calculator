const io = require('socket.io')(8080)

/**
 * Register a new namespace.
 * Do not overlap with default namespace,
 * in case other socket is using it.
 */
const piNamespace = '/pi-job'

/**
 * The number of clients that we split
 * the calculations.
 */
const targetConnectedClients = 2

/**
 * Used to find the difference from the estimated PI.
 */
const realPI = 3.1415924535897932384646433832795027841971693993873058

/**
 * How many summation chunks to calculate per client.
 */
const chunksPerClient = 1e8

/**
 * What is the upper limit of the summation?
 */
const totalChunksSize = chunksPerClient * targetConnectedClients

/**
 * Generator that return the current chunk index.
 */
function* generatorChunkIndex() {
  for (
    let currentChunkIndex = 0;
    currentChunkIndex < totalChunksSize;
    currentChunkIndex += chunksPerClient
  ) {
    yield currentChunkIndex
  }
}

/**
 * The current number of connected clients.
 */
let connectedClients = 0

/**
 * Number o clients that received a job and
 * not finished yet.
 */
let jobsPending = 0

let summationResult = 0

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
    /**
     * Generator instance,
     */
    const trackChunkIndex = generatorChunkIndex()

    for (const client of clients) {
      const currentChunkIndex = trackChunkIndex.next().value
      /**
       * For each client assign a job.
       */
      client.emit('pi-job', { chunksPerClient, currentChunkIndex })
      jobsPending += 1
    }
  }

  /**
   * Upon job completion from a client:
   */
  socket.on('data', ({ chunk }) => {
    /**
     * Decrease the pending jobs and
     * terminate the client connection.
     */
    jobsPending -= 1
    socket.emit('close')

    console.log(chunk)

    /**
     * When the client calculates the chunk,
     * get the result and increase the summation result.
     */
    summationResult += chunk

    /**
     * If all the clients finished their jobs,
     * estimate the PI and close the server.
     */
    if (jobsPending === 0) {
      /**
       * Estimate the PI.
       */
      const estimatedPI = 4 * summationResult

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
