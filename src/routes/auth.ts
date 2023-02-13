import jwt from 'jsonwebtoken'
import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from 'fastify'
import { envs } from '@configs/env'

async function router(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: (err?: Error) => void
) {
  fastify.route({
    method: 'POST',
    url: '/token',
    schema: {
      tags: ['Auth'],
      headers: {
        type: 'object',
        properties: {
          system: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { system } = request.headers
      const { id } = request.body as { id: string }
      if (system === envs.API_KEY) {
        reply.send({
          token: jwt.sign(
            {
              roles: ['system'],
              actor_id: id,
            },
            envs.JWT_SECRET
          ),
        })
      }
      reply.code(401)
    },
  })

  done()
}

export { router }
