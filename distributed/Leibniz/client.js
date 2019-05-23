const io = require('socket.io-client')

/**
 * Register a new namespace.
 * Do not overlap with default namespace,
 * in case other socket is using it.
 */
const piNamespace = '/pi-job'

/**
 * Create a new socket connection to specify domain.
 */
const socket = io('http://localhost:8080' + piNamespace)

/**
 * On successfully client connection.
 */
socket.on('connect', () => {
  console.log('Client successfully registered. Waiting for PI job... ')
})

/**
 * Signal emit from server to gracefully terminate the
 * connection.
 */
socket.on('close', () => {
  console.log('\nConnection to server terminated gracefully.')
  socket.close()
})

/**
 * Got a new PI job.
 */
socket.on('pi-job', request => {
  console.log('Job received from server...')

  /**
   * Calculate the summation chunk.
   */
  const chunk = calcSummationChunk(request)

  /**
   * Send the calculated data back to the server.
   */
  socket.emit('data', { chunk })
})

/**
 * Calculate a chunk of the summation.
 * See https://en.wikipedia.org/wiki/Leibniz_formula_for_%CF%80#Convergence
 */
function calcSummationChunk({ currentChunkIndex, chunksPerClient }) {
  let temp = 0
  for (i = 0; i < chunksPerClient; i += 1) {
    temp +=
      2 /
      ((4 * (currentChunkIndex + i) + 1) * (4 * (currentChunkIndex + i) + 3))
  }

  return temp
}
