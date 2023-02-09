import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import { Node, Workflow } from "../types"

const controllers = (fastify: FastifyInstance) => {
    const { redis } = fastify
    return {
        read: async (request: FastifyRequest, reply: FastifyReply) => {
            const { name: workflow_name } = request.params as { name: string}
            const data = await redis.get(`workflows:${workflow_name}`)
            reply.send(JSON.parse(data || '{}'))
        },
        create: async (request: FastifyRequest, reply: FastifyReply) => {
            const { body } = request as { body: Workflow }
            const { blueprint_spec: { nodes }, name } = body
            const startNode = nodes.find((node: Node) => node.type === 'start')
            if(startNode?.category === 'event') {
                const { parameters: { events } } = startNode
                const [{ definition }] = events
                await redis.set(`workflow_targets:${definition}`, JSON.stringify({
                    workflow_name: name,
                    target: definition
                }))
            }
            const response = await redis.set(`workflows:${body.name}`, JSON.stringify(body))
            reply.send(response)
        },
        delete: async (request: FastifyRequest, reply: FastifyReply) => {
            const { name: workflow_name } = request.params as { name: string}
            const response = await redis.del(`workflows:${workflow_name}`)
            reply.send(response)
        }
    }
}

export {
    controllers
}