import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { verifyJWT } from '../auth/auth'
import {
    pr
} from '../controllers'

async function router(fastify: FastifyInstance, options: FastifyPluginOptions, _done: ((err?: Error) => void)) {
    const { producer } = options

    const { 
        start,
        continue_
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

    fastify.route({
        method: 'POST',
        url: '/continue/:process_id',
        preHandler: fastify.auth([
            verifyJWT
        ]),
        schema: {
            security: [{ BearerToken: [] }],
            tags: ['Process'],
            params: {
                type: 'object',
                properties: {
                    process_id: { type: 'string' }
                }
            },
            body: {
                type: 'object'
            }
        },
        handler: continue_
    })
}

export {
    router
}