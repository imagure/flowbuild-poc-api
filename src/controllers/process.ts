import { Producer } from 'kafkajs'
import { v4 as uuid } from 'uuid'
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
        const pid = uuid()
        const message = JSON.stringify({
          input: body,
          workflow: JSON.parse(data),
          process_id: pid,
          actor,
        })
        await producer.send({
          topic: 'orchestrator-start-process-topic',
          messages: [{ value: message }],
        })
        reply.code(202)
        reply.send({
          workflow_name,
          process_id: pid,
        })
      }
      reply.code(400)
      reply.send('NOK')
    },
    continue_: async (request: FastifyRequest, reply: FastifyReply) => {
      const { process_id } = request.params as { process_id: string }
      const { body, actor } = request as IActorRequest
      const data = await redis.get(`process_history:${process_id}`)

      let workflow
      if (data) {
        const workflow_name = JSON.parse(data || '{}').workflow_name
        workflow = await redis.get(`workflows:${workflow_name}`)
      }

      if (data && workflow) {
        const parsedWorkflow = JSON.parse(workflow)
        const message = JSON.stringify({
          input: body,
          workflow: parsedWorkflow,
          process_id,
          actor,
        })
        await producer.send({
          topic: 'orchestrator-continue-process-topic',
          messages: [{ value: message }],
        })
        reply.code(200)
        reply.send({
          workflow_name: parsedWorkflow.name,
          process_id,
        })
      }
      reply.code(400)
      reply.send('NOK')
    },
  }
}

export { controllers }
