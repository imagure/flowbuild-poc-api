import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import {
    pr
} from '../controllers'

async function router(fastify: FastifyInstance, options: FastifyPluginOptions, done: Function) {
    const { producer } = options

    const { 
        start 
    } = pr(fastify, producer)
    
    fastify.route({
        method: 'POST',
        url: '/start/:workflow_name',
        schema: {
            tags: ['Process'],
            params: {
                type: 'object',
                properties: {
                    workflow_name: { type: 'string' }
                }
            },
            body: {
                type: 'object'
            }
        },
        handler: start
    })

    done()
}

export {
    router
}