import { SocketStream } from '@fastify/websocket'
import { IActorRequest } from '@common-types'
import { emitter } from '@websocket/tools/emitter'
import { WSFilter } from '../types'

const processState = {
  listener: (connection: SocketStream, request: IActorRequest) => {
    const { actor } = request
    if (actor) {
      const { id: actor_id } = actor

      let filters: WSFilter = {}

      connection.socket.on('message', (message) => {
        try {
          const stringifiedMessage = message.toString()
          const parsedMessage = JSON.parse(stringifiedMessage)
          const { filter } = parsedMessage
          filters = filter
        } catch (e) {
          console.error(e)
        }
      })

      connection.socket.on('close', (_message) => {
        emitter.removeAllListeners(`process_state_${actor_id}`)
        console.info(`CONNECTION_CLOSED on ACTOR ID: ${actor_id}`)
      }) // Validate how necessecary that is

      emitter.on(`process_state_${actor_id}`, (inputMessage) => {
        const workflow_name = inputMessage?.process_data?.workflow_name
        const filterSetting = filters[workflow_name]

        if (filterSetting) {
          const processStatus = inputMessage.process_data?.state?.status
          const { status: statusFilter } = filterSetting

          let sendMessage = true
          if (statusFilter.length) {
            if (!processStatus || !statusFilter.includes(processStatus)) {
              sendMessage = false
            }
          }

          if (sendMessage) {
            connection.socket.send(JSON.stringify(inputMessage))
          }
        }
      })
    }
  },
}

export { processState }
