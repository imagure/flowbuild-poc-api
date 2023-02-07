import { FastifyInstance } from "fastify"
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'

export const swagger = async(fastify: FastifyInstance) => {
    await fastify.register(fastifySwagger, {
        swagger: {
            info: {
                title: 'Flowbuild POC swagger',
                description: 'Testing Flowbuild with Kafka',
                version: '0.1.0'
            },
            host: 'localhost',
            schemes: ['http'],
            consumes: ['application/json'],
            produces: ['application/json'],
            tags: [
                { name: 'Health', description: 'Health Check' },
                { name: 'Workflow', description: 'Workflow CRUD operations' },
                { name: 'Process', description: 'Process related operations' }
            ],
            definitions: {
                Workflow: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        description: { type: 'string' },
                        blueprint_spec: { type: 'object' }
                    },
                    required: ['name', 'description', 'blueprint_spec']
                }
            }
        }
    })

    await fastify.register(fastifySwaggerUI, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'full',
            deepLinking: false
        }
    })
}