/* eslint-disable @typescript-eslint/no-empty-function */

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { app } from '@src/app'
import { verifyJWT } from '@auth'

const startMock = jest.fn((_request: FastifyRequest, reply: FastifyReply) => {
  reply.send('OK')
})
const continueMock = jest.fn(
  (_request: FastifyRequest, reply: FastifyReply) => {
    reply.send('OK')
  }
)
jest.mock('@controllers', () => {
  return {
    wf: (_fastify: FastifyInstance) => {
      return {
        read: jest.fn(() => {}),
        create: jest.fn(() => {}),
        delete: jest.fn(() => {}),
      }
    },
    pr: (_fastify: FastifyInstance) => {
      return {
        start: startMock,
        continue_: continueMock,
      }
    },
  }
})

let server: FastifyInstance
const PORT = 3003
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

it('should call START Process', async () => {
  await fetch(`http://0.0.0.0:${PORT}/process/start/<WORKFLOW_NAME>`, {
    method: 'post',
    body: JSON.stringify({
      anyKey: 'anyValue',
    }),
    headers: { 'Content-Type': 'application/json' },
  })

  expect(verifyJWT).toHaveBeenCalledTimes(1)
  expect(startMock).toHaveBeenCalledTimes(1)
})

it('should call CONTINUE PROCESS', async () => {
  await fetch(`http://0.0.0.0:${PORT}/process/continue/<PROCESS_ID>`, {
    method: 'post',
    body: JSON.stringify({
      anyKey: 'anyValue',
    }),
    headers: { 'Content-Type': 'application/json' },
  })

  expect(verifyJWT).toHaveBeenCalledTimes(1)
  expect(continueMock).toHaveBeenCalledTimes(1)
})
