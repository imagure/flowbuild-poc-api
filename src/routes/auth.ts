import jwt from 'jsonwebtoken'
import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify'
import { envs } from '../configs/env'

async function router(fastify: FastifyInstance, options: FastifyPluginOptions, done: Function) {
    fastify.route({
        method: 'POST',
        url: '/token',
        schema: {
            tags: ['Auth'],
            headers: {
                type: 'object',
                properties: {
                    system: { type: 'string' }
                }
            }
        },
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const { system } = request.headers
            if (system === envs.API_KEY) {
                reply.send({
                    token: jwt.sign({
                        role: 'system'
                    }, envs.JWT_SECRET)
                })
            }
            reply.code(401)
        }
    })

    done()
}

export {
    router
}