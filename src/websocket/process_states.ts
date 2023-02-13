import { SocketStream } from '@fastify/websocket'
import EventEmitter from 'events'
import { FastifyInstance } from 'fastify'
import { Consumer, EachMessagePayload } from 'kafkajs'
import { verifyJWT } from '../auth/auth'
import { IActorRequest } from '../types'

const emitter = new EventEmitter()

async function processSocket(consumer: Consumer) {
  await consumer.run({
    eachMessage: async ({ message }: EachMessagePayload): Promise<void> => {
      const receivedMessage = message.value?.toString() || ''
      try {
        const inputMessage = JSON.parse(receivedMessage)
        emitter.emit(`process_state_${inputMessage.actor_id}`, inputMessage)
      } catch (err) {
        console.error(err)
      }
    },
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
      (connection: SocketStream, request: IActorRequest) => {
        const { actor } = request
        if (actor) {
          const { id: actor_id } = actor

          connection.socket.on('message', (message) => {
            connection.socket.send(
              `${message} Message Received. Nothing will happen`
            )
          })

          connection.socket.on('close', (_message) => {
            emitter.removeAllListeners(`process_state_${actor_id}`)
            console.info(`CONNECTION_CLOSED on ACTOR ID: ${actor_id}`)
          }) // Validate how necessecary that is

          emitter.on(`process_state_${actor_id}`, (inputMessage) => {
            connection.socket.send(JSON.stringify(inputMessage))
          })
        }
      }
    )
  }
}

export { processSocket }
