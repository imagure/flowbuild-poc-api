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
        handler: read
    })

    fastify.route({
        method: 'POST',
        url: '/create',
        handler: create
    })

    fastify.route({
        method: 'DELETE',
        url: '/:name',
        handler: deleteWorkflow
    })

    done()
}

export {
    router
}