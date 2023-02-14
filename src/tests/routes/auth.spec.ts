import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { app } from '@src/app'
import { envs } from '@configs/env'

let server: FastifyInstance
const PORT = 3004
beforeAll(async () => {
  server = await app({
    logger: false,
  })
  await server.listen({ port: PORT, host: '0.0.0.0' })
  await server.ready()
})

beforeEach(async () => {
  jest.clearAllMocks()
})

afterAll(async () => {
  await server.close()
})

it('should AUTHENTICATE SYSTEM actor', async () => {
  const response = await fetch(`http://0.0.0.0:${PORT}/auth/token`, {
    method: 'post',
    body: JSON.stringify({
      id: 'TEST_SYSTEM_ACTOR',
    }),
    headers: {
      'Content-Type': 'application/json',
      system: envs.API_KEY,
    },
  })

  expect(response.status).toEqual(201)
  const responseJson = await response.json()
  expect(responseJson.token).toBeDefined()
})

it('should NOT AUTHENTICATE if there is NO ID', async () => {
  const response = await fetch(`http://0.0.0.0:${PORT}/auth/token`, {
    method: 'post',
    body: JSON.stringify({}),
    headers: {
      'Content-Type': 'application/json',
      system: envs.API_KEY,
    },
  })

  expect(response.status).toEqual(401)
})

it('should NOT AUTHENTICATE if API KEY is INVALID', async () => {
  const response = await fetch(`http://0.0.0.0:${PORT}/auth/token`, {
    method: 'post',
    body: JSON.stringify({
      id: 'TEST_SYSTEM_ACTOR',
    }),
    headers: {
      'Content-Type': 'application/json',
      system: 'INVALID-API-KEY',
    },
  })

  expect(response.status).toEqual(401)
})
