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
   * Calculate the total amount of in circle points
   * and return the result to server.
   */
  const incircle = getInCirclePoints(request)

  /**
   * Send the calculated data back to the server.
   */
  socket.emit('data', { incircle })
})

/**
 * Get the total amount of points that exist within the circle.
 */
function getInCirclePoints({ pointsPerClient }) {
  let incircle = 0

  for (let i = 0; i < pointsPerClient; i += 1) {
    const x = Math.random()
    const y = Math.random()

    if (Math.sqrt(x * x + y * y) < 1) {
      incircle += 1
    }
  }

  return incircle
}
