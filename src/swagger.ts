import { FastifyInstance } from "fastify"
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { envs } from "./configs/env"

export const swagger = async(fastify: FastifyInstance) => {
    await fastify.register(fastifySwagger, {
        swagger: {
            info: {
                title: 'Flowbuild POC swagger',
                description: 'Testing Flowbuild with Kafka',
                version: '0.1.0'
            },
            host: `${envs.SERVER_HOST==='localhost' ? `${envs.SERVER_HOST}:${envs.SERVER_PORT}` : envs.SERVER_HOST}`,
            schemes: ['http'],
            consumes: ['application/json'],
            produces: ['application/json'],
            tags: [
                { name: 'Health', description: 'Health Check' },
                { name: 'Auth', description: 'API system authentication' },
                { name: 'Workflow', description: 'Workflow CRUD operations' },
                { name: 'Process', description: 'Process related operations' },
                { name: 'WebSocket', description: 'Process state responses' }
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
            },
            securityDefinitions: {
                BearerToken: {
                    description: 'Authorization header token, sample: "Bearer #TOKEN#"',
                    type: "apiKey",
                    name: 'Authorization',
                    in: 'header'
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