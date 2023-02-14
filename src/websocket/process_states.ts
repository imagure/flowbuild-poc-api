import { FastifyInstance } from 'fastify'
import { Consumer } from 'kafkajs'
import { verifyJWT } from '@auth'
import { eventEmiter } from '@websocket/emitters'
import { processState } from '@websocket/listeners'

async function processSocket(consumer: Consumer) {
  await consumer.run({
    eachMessage: eventEmiter,
  })
  return async (fastify: FastifyInstance) => {
    fastify.get(
      '/process',
      {
        websocket: true,
        preHandler: fastify.auth([verifyJWT]),
        schema: {
          security: [{ BearerToken: [] }],
          tags: ['WebSocket'],
        },
      },
      processState.listener
    )
  }
}

export { processSocket }
