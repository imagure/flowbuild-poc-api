import Fastify from 'fastify'
import { connect } from './kafka'
import fastifyRedis from '@fastify/redis'

const runServer = async () => {
    const fastify = Fastify({
        logger: true
    })

    fastify.register(fastifyRedis, { 
        host: `${process.env.REDIS_HOST || 'localhost'}`, 
        port: 6379,
        password: 'eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81'
    })

    const { producer } = await connect()
    
    fastify.get('/health', (request, reply) => {
        reply.send('OK')
    })

    fastify.get('/workflow/:name', async (request, reply) => {
        const { name: workflow_name } = request.params as any
        const { redis } = fastify
        const data = await redis.get(workflow_name)
        reply.send(JSON.parse(data || '{}'))
    })

    fastify.post('/workflow/create', async (request, reply) => {
        const { body } = request as any
        const { redis } = fastify
        const response = await redis.set(body.name, JSON.stringify(body))
        reply.send(response)
    })

    fastify.post('/process/start/:workflow_name', async (request, reply) => {
        const { workflow_name } = request.params as any
        const { body } = request as any
        const { redis } = fastify
        const data = await redis.get(workflow_name)
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