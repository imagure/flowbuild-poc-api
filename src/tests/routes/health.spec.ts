/* eslint-disable @typescript-eslint/no-empty-function */

import { FastifyInstance } from 'fastify'
import { app } from '@src/app'
import { envs } from '@configs/env'

jest.mock('@kafka', () => {
  return {
    connect: () => {
      return {
        consumer: {
          run: () => {},
        },
        producer: {},
      }
    },
  }
})

let server: FastifyInstance
beforeAll(async () => {
  server = await app({
    logger: false,
  })
  await server.listen({ port: envs.SERVER_PORT, host: '0.0.0.0' })
  await server.ready()
})

afterAll(async () => {
  await server.close()
})

it('should health check', async () => {
  const response = await fetch(`http://0.0.0.0:${envs.SERVER_PORT}/health`)

  expect(response.status).toEqual(200)
})
