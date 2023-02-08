import EventEmitter from "events"
import { FastifyInstance } from "fastify"
import { Consumer } from "kafkajs"

const emitter = new EventEmitter();

async function processSocket(consumer: Consumer) {
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) : Promise<void>=> {
            const receivedMessage = message.value?.toString() || ''
            try {
                const inputMessage = JSON.parse(receivedMessage)
                emitter.emit(`process_state_${inputMessage.actor_id}`, inputMessage)
            } catch(err) {
                console.error(err)
            }
        },
    })
    return async (fastify: FastifyInstance) => {
        fastify.get(
            '/process/:actor_id', 
            { 
                websocket: true, 
                schema: { tags: ['WebSocket'] } 
            }, 
            (connection /* SocketStream */, req /* FastifyRequest */) => {
            
                const { params } = req
                const { actor_id } = params as { actor_id: string }
                
                connection.socket.on('message', message => {
                    connection.socket.send(`${message} Message Received. Nothing will happen`)
                })

                connection.socket.on('close', message => {
                    console.info("CONNECTION_CLOSED")
                    emitter.removeListener(`process_state_${actor_id}`, ()=> {})
                }) // Validate how necessecary that is

                emitter.on(`process_state_${actor_id}`, (inputMessage) => {
                    connection.socket.send(JSON.stringify(inputMessage))
                })
            }
        )
    }
}

export {
    processSocket
}