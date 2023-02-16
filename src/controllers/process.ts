import { Producer } from 'kafkajs'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { IActorRequest } from '@common-types'

const controllers = (fastify: FastifyInstance, producer: Producer) => {
  const { redis } = fastify
  return {
    start: async (request: FastifyRequest, reply: FastifyReply) => {
      const { workflow_name } = request.params as { workflow_name: string }
      const { body, actor } = request as IActorRequest
      const data = await redis.get(`workflows:${workflow_name}`)
      if (data) {
        const message = JSON.stringify({
          input: body,
          workflow_name,
          actor,
        })
        await producer.send({
          topic: 'orchestrator-start-process-topic',
          messages: [{ value: message }],
        })
        reply.code(202)
        reply.send('OK')
      }
      reply.code(400)
      reply.send('NOK')
    },
    continue_: async (request: FastifyRequest, reply: FastifyReply) => {
      const { process_id } = request.params as { process_id: string }
      const { body, actor } = request as IActorRequest
      const data = await redis.get(`process_history:${process_id}`)
      if (data) {
        const message = JSON.stringify({
          input: body,
          workflow_name: JSON.parse(data).workflow_name,
          process_id,
          actor,
        })
        await producer.send({
          topic: 'orchestrator-continue-process-topic',
          messages: [{ value: message }],
        })
        reply.code(200)
        reply.send('OK')
      }
      reply.code(400)
      reply.send('NOK')
    },
  }
}

export { controllers }
