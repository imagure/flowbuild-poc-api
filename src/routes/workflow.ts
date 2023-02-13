import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { verifyJWT } from '@auth'
import { wf } from '@controllers'

async function router(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  _done: (err?: Error) => void
) {
  const { read, create, delete: deleteWorkflow } = wf(fastify)

  fastify.route({
    method: 'GET',
    url: '/:name',
    preHandler: fastify.auth([verifyJWT]),
    schema: {
      security: [{ BearerToken: [] }],
      tags: ['Workflow'],
      params: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      },
    },
    handler: read,
  })

  fastify.route({
    method: 'POST',
    url: '/create',
    preHandler: fastify.auth([verifyJWT]),
    schema: {
      security: [{ BearerToken: [] }],
      tags: ['Workflow'],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          blueprint_spec: { type: 'object' },
        },
        required: ['name', 'description', 'blueprint_spec'],
      },
    },
    handler: create,
  })

  fastify.route({
    method: 'DELETE',
    url: '/:name',
    preHandler: fastify.auth([verifyJWT]),
    schema: {
      security: [{ BearerToken: [] }],
      tags: ['Workflow'],
      params: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      },
    },
    handler: deleteWorkflow,
  })
}

export { router }
