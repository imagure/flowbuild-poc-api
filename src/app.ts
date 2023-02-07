import Fastify from 'fastify'
import { connect } from './kafka'
import fastifyRedis from '@fastify/redis'
import { envs } from './configs/env'
import {
    wf as wf_router,
    pr as pr_router
} from './routes'

const runServer = async () => {
    const fastify = Fastify({
        logger: true
    })

    fastify.register(fastifyRedis, { 
        host: envs.REDIS_HOST, 
        port: envs.REDIS_PORT,
        password: envs.REDIS_PASSWORD
    })

    const { producer } = await connect()
    fastify.decorate('producer', producer)

    fastify.get('/health', (request, reply) => {
        reply.send('OK')
    })

    fastify.register(wf_router, {prefix: 'workflow'})

    fastify.register(pr_router, {producer, prefix: '/process'})
    
    fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
        if (err) throw err
        console.info(`Server is running on ${address}`)
    })
}

runServer()