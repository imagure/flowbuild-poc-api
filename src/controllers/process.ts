import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import { Producer } from "kafkajs"
import { IActorRequest } from "../types"

const controllers = (fastify: FastifyInstance, producer: Producer) => {
    const { redis } = fastify
    return {
        start: async (request: FastifyRequest, reply: FastifyReply) => {
            const { workflow_name } = request.params as { workflow_name: string }
            const { body, actor } = request as IActorRequest
            const data = await redis.get(`workflows:${workflow_name}`)
            if(data) {
                const message = JSON.stringify({
                    input: body,
                    workflow_name,
                    actor
                })
                await producer.send({
                    topic: 'orchestrator-start-process-topic',
                    messages: [{ value: message }]
                })
                reply.send('OK')
            }
            reply.send('NOK')
        },
    }
}

export {
    controllers
}