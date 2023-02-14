import { EachMessagePayload } from 'kafkajs'
import { emitter } from '@websocket/tools/emitter'

const processStateEmitter = async ({
  message,
}: EachMessagePayload): Promise<void> => {
  const receivedMessage = message.value?.toString() || ''
  try {
    const inputMessage = JSON.parse(receivedMessage)
    emitter.emit(`process_state_${inputMessage.actor_id}`, inputMessage)
  } catch (err) {
    console.error(err)
  }
}

export { processStateEmitter }
