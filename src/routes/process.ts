import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { verifyJWT } from '../auth/auth'
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
        preHandler: fastify.auth([
            verifyJWT
        ]),
        schema: {
            security: [{ BearerToken: [] }],
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
}

export {
    router
}