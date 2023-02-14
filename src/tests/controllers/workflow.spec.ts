import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from 'fastify'
import { wf } from '@controllers'
import { app } from '@src/app'
import { FastifyRedis } from '@fastify/redis'

let redisMap = {} as { [key: string]: string }
const mockRedis = {
  get: jest.fn(async (key: string) => redisMap[key]),
  set: jest.fn(async (key: string, value: string, opts: any) => {
    redisMap[key] = value
    return 'OK'
  }),
  del: jest.fn(async (key: string) => delete redisMap[key]),
} as unknown as FastifyRedis

const reply = {
  send: jest.fn((_resp) => {}),
  code: jest.fn((_code) => {}),
}

let create: (request: any, reply: any) => Promise<void>,
  read: (request: any, reply: any) => Promise<void>,
  delete_: (request: any, reply: any) => Promise<void>

let fastify: FastifyInstance
beforeAll(async () => {
  fastify = await app({
    logger: false,
  })
  fastify.redis = mockRedis
  ;({ create, read, delete: delete_ } = wf(fastify))
})

beforeEach(async () => {
  redisMap = {}
  jest.clearAllMocks()
})

it('should run CREATE Workflow', async () => {
  const request = {
    body: {
      name: 'TEST_WORKFLOW',
      description: 'test workflow blueprint',
      blueprint_spec: {
        nodes: [
          {
            type: 'start',
          },
        ],
      },
    },
  }
  await create(request, reply)

  expect(mockRedis.set).toHaveBeenCalledTimes(1)
  expect(mockRedis.set).toHaveBeenCalledWith(
    'workflows:TEST_WORKFLOW',
    JSON.stringify(request.body)
  )
  expect(reply.code).toHaveBeenCalledTimes(1)
  expect(reply.code).toHaveBeenCalledWith(201)
  expect(reply.send).toHaveBeenCalledTimes(1)
  expect(reply.send).toHaveBeenCalledWith('OK')
})

it('should run CREATE Workflow and create TARGET', async () => {
  const request = {
    body: {
      name: 'TEST_WORKFLOW',
      description: 'test workflow blueprint',
      blueprint_spec: {
        nodes: [
          {
            type: 'start',
            category: 'event',
            parameters: {
              events: [{ definition: 'TEST_TARGET_NAME' }],
            },
          },
        ],
      },
    },
  }
  await create(request, reply)

  expect(mockRedis.set).toHaveBeenCalledTimes(2)
  expect(mockRedis.set).toHaveBeenNthCalledWith(
    1,
    'workflow_targets:TEST_TARGET_NAME',
    JSON.stringify({
      workflow_name: 'TEST_WORKFLOW',
      target: 'TEST_TARGET_NAME',
    })
  )
  expect(mockRedis.set).toHaveBeenNthCalledWith(
    2,
    'workflows:TEST_WORKFLOW',
    JSON.stringify(request.body)
  )
  expect(reply.code).toHaveBeenCalledTimes(1)
  expect(reply.code).toHaveBeenCalledWith(201)
  expect(reply.send).toHaveBeenCalledTimes(1)
  expect(reply.send).toHaveBeenCalledWith('OK')
})

it('should run READ Workflow', async () => {
  const testBlueprint = { testKey: 'testValue' }
  mockRedis.set('workflows:TEST_WORKFLOW', JSON.stringify(testBlueprint))
  const request = {
    params: {
      name: 'TEST_WORKFLOW',
    },
  }
  await read(request, reply)

  expect(mockRedis.get).toHaveBeenCalledTimes(1)
  expect(mockRedis.get).toHaveBeenCalledWith('workflows:TEST_WORKFLOW')
  expect(reply.code).toHaveBeenCalledTimes(1)
  expect(reply.code).toHaveBeenCalledWith(200)
  expect(reply.send).toHaveBeenCalledTimes(1)
  expect(reply.send).toHaveBeenCalledWith(testBlueprint)
})

it('should run DELETE Workflow', async () => {
  const testBlueprint = { testKey: 'testValue' }
  mockRedis.set('workflows:TEST_WORKFLOW', JSON.stringify(testBlueprint))
  const request = {
    params: {
      name: 'TEST_WORKFLOW',
    },
  }
  await delete_(request, reply)

  expect(mockRedis.del).toHaveBeenCalledTimes(1)
  expect(mockRedis.del).toHaveBeenCalledWith('workflows:TEST_WORKFLOW')
  expect(reply.code).toHaveBeenCalledTimes(1)
  expect(reply.code).toHaveBeenCalledWith(204)
  expect(reply.send).toHaveBeenCalledTimes(1)
  expect(reply.send).toHaveBeenCalledWith(true)
})
