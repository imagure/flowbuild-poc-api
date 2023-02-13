import Fastify, { FastifyServerOptions } from 'fastify'
import { connect } from './kafka'
import fastifyCors from '@fastify/cors'
import fastifyAuth from '@fastify/auth'
import fastifyRedis from '@fastify/redis'
import fastifyWebsocket from '@fastify/websocket'
import { envs } from '@configs/env'
import { wf as wf_router, pr as pr_router, auth as auth_router } from '@routes'
import { swagger } from '@swagger'
import { processSocket } from '@websocket'

const app = async (opts?: FastifyServerOptions) => {
  const fastify = Fastify(opts)

  swagger(fastify)

  fastify.register(fastifyAuth)

  await fastify.register(fastifyCors, {
    origin: '*',
  })

  fastify.register(fastifyWebsocket)

  fastify.register(fastifyRedis, {
    host: envs.REDIS_HOST,
    port: envs.REDIS_PORT,
    password: envs.REDIS_PASSWORD,
  })

  const { consumer, producer } = await connect()

  fastify.get('/health', { schema: { tags: ['Health'] } }, (request, reply) => {
    reply.send('OK')
  })

  fastify.register(auth_router, { prefix: '/auth' })
  fastify.register(wf_router, { prefix: '/workflow' })
  fastify.register(pr_router, { prefix: '/process', producer })
  fastify.register(await processSocket(consumer))

  return fastify
}

export { app }
