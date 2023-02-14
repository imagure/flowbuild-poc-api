import { SocketStream } from '@fastify/websocket'
import { IActorRequest } from '@common-types'
import { emitter } from '@websocket/tools/emitter'

const processState = {
  listener: (connection: SocketStream, request: IActorRequest) => {
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
  },
}

export { processState }
