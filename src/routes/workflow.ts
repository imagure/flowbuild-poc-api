import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import {
    wf
} from '../controllers'

async function router(fastify: FastifyInstance, options: FastifyPluginOptions, done: Function) {
    const { 
        read, 
        create, 
        delete: deleteWorkflow
    } = wf(fastify)

    fastify.route({
        method: 'GET',
        url: '/:name',
        schema: {
            tags: ['Workflow'],
            params: {
                type: 'object',
                properties: {
                    name: { type: 'string' }
                }
            }
        },
        handler: read
    })

    fastify.route({
        method: 'POST',
        url: '/create',
        schema: {
            tags: ['Workflow'],
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    blueprint_spec: { type: 'object' }
                },
                required: ['name', 'description', 'blueprint_spec']
            }
        },
        handler: create
    })

    fastify.route({
        method: 'DELETE',
        url: '/:name',
        schema: {
            tags: ['Workflow'],
            params: {
                type: 'object',
                properties: {
                    name: { type: 'string' }
                }
            }
        },
        handler: deleteWorkflow
    })

    done()
}

export {
    router
}