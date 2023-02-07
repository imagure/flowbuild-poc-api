import Fastify from 'fastify'
import { connect } from './kafka'
import fastifyRedis from '@fastify/redis'
import { envs } from './configs/env'
import {
    wf as wf_router,
    pr as pr_router
} from './routes'
import { swagger } from './swagger'

const runServer = async () => {
    const fastify = Fastify({
        logger: true
    })
    
    swagger(fastify)

    fastify.register(fastifyRedis, { 
        host: envs.REDIS_HOST, 
        port: envs.REDIS_PORT,
        password: envs.REDIS_PASSWORD
    })

    const { producer } = await connect()

    fastify.get('/health', {schema: { tags: ['Health'] } }, (request, reply) => {
        reply.send('OK')
    })

    fastify.register(wf_router, { prefix: '/workflow' })

    fastify.register(pr_router, { prefix: '/process', producer })

    fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
        if (err) throw err
        console.info(`Server is running on ${address}`)
    })

    await fastify.ready()
    fastify.swagger()

}

runServer()