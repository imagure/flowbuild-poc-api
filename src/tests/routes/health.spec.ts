/* eslint-disable @typescript-eslint/no-empty-function */

import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { app } from '@src/app'

jest.mock('@fastify/redis', () => {
  return (
    _f: FastifyInstance,
    _o: FastifyPluginOptions,
    done: (err?: Error) => void
  ) => {
    done()
  }
})

let server: FastifyInstance
const PORT = 3001
beforeAll(async () => {
  server = await app({
    logger: false,
  })
  await server.listen({ port: PORT, host: '0.0.0.0' })
  await server.ready()
})

afterAll(async () => {
  await server.close()
})

it('should health check', async () => {
  const response = await fetch(`http://0.0.0.0:${PORT}/health`)

  expect(response.status).toEqual(200)
})
