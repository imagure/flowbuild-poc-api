import Fastify from 'fastify'
import { connect } from './kafka'
import fastifyRedis from '@fastify/redis'
import { envs } from './configs/env'
import { Workflow } from './types'

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
    
    fastify.get('/health', (request, reply) => {
        reply.send('OK')
    })

    fastify.get('/workflow/:name', async (request, reply) => {
        const { name: workflow_name } = request.params as { name: string}
        const { redis } = fastify
        const data = await redis.get(`workflows:${workflow_name}`)
        reply.send(JSON.parse(data || '{}'))
    })

    fastify.post('/workflow/create', async (request, reply) => {
        const { body } = request as { body: Workflow }
        const { redis } = fastify
        const response = await redis.set(`workflows:${body.name}`, JSON.stringify(body))
        reply.send(response)
    })

    fastify.post('/process/start/:workflow_name', async (request, reply) => {
        const { workflow_name } = request.params as { workflow_name: string }
        const { body } = request as { body: {[key: string]: string} }
        const { redis } = fastify
        const data = await redis.get(`workflows:${workflow_name}`)
        if(data) {
            const message = JSON.stringify({
                input: body,
                workflow_name
            })
            const temp = await producer.send({
                topic: 'orchestrator-start-process-topic',
                messages: [{ value: message }]
            })
            console.info(temp)
            reply.send('OK')
        }
        reply.send('NOK')
    })
    
    fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
        if (err) throw err
        console.info(`Server is running on ${address}`)
    })
}

runServer()