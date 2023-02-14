/* eslint-disable @typescript-eslint/no-empty-function */

import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from 'fastify'
import { app } from '@src/app'
import { verifyJWT } from '@auth'

const readMock = jest.fn((_request: FastifyRequest, reply: FastifyReply) => {
  reply.send('OK')
})
const createMock = jest.fn((_request: FastifyRequest, reply: FastifyReply) => {
  reply.send('OK')
})
const deleteMock = jest.fn((_request: FastifyRequest, reply: FastifyReply) => {
  reply.send()
})
jest.mock('@controllers', () => {
  return {
    wf: (_fastify: FastifyInstance) => {
      return {
        read: readMock,
        create: createMock,
        delete: deleteMock,
      }
    },
    pr: (_fastify: FastifyInstance) => {
      return {
        start: jest.fn(() => {}),
        continue_: jest.fn(() => {}),
      }
    },
  }
})

let server: FastifyInstance
const PORT = 3002
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

it('should call CREATE Workflow', async () => {
  await fetch(`http://0.0.0.0:${PORT}/workflow/create`, {
    method: 'post',
    body: JSON.stringify({
      name: 'test_workflow',
      description: 'test workflow bp',
      blueprint_spec: {},
    }),
    headers: { 'Content-Type': 'application/json' },
  })

  expect(verifyJWT).toHaveBeenCalledTimes(1)
  expect(createMock).toHaveBeenCalledTimes(1)
})

it('should call READ Workflow', async () => {
  await fetch(`http://0.0.0.0:${PORT}/workflow/<WORKFLOW_NAME>`, {
    method: 'get',
  })

  expect(verifyJWT).toHaveBeenCalledTimes(1)
  expect(readMock).toHaveBeenCalledTimes(1)
})

it('should call DELETE Workflow', async () => {
  await fetch(`http://0.0.0.0:${PORT}/workflow/<WORKFLOW_NAME>`, {
    method: 'delete',
  })

  expect(verifyJWT).toHaveBeenCalledTimes(1)
  expect(deleteMock).toHaveBeenCalledTimes(1)
})
