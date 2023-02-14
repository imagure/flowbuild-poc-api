import { FastifyInstance } from 'fastify'
import { pr } from '@controllers'
import { app } from '@src/app'
import { FastifyRedis } from '@fastify/redis'
import { connect } from '@kafka'
import { Producer } from 'kafkajs'

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
  send: jest.fn((_resp) => {
    return
  }),
  code: jest.fn((_code) => {}),
}

let start: (request: any, reply: any) => Promise<void>,
  continue_: (request: any, reply: any) => Promise<void>

let fastify: FastifyInstance
let producer: Producer
beforeAll(async () => {
  fastify = await app({
    logger: false,
  })
  fastify.redis = mockRedis
  ;({ producer } = await connect())
  ;({ start, continue_ } = pr(fastify, producer))
})

beforeEach(async () => {
  redisMap = {}
  jest.clearAllMocks()
})

it('should run START Process', async () => {
  const testWorkflow = { testKey: 'testValue' }
  mockRedis.set('workflows:TEST_WORKFLOW', JSON.stringify(testWorkflow))
  const request = {
    params: {
      workflow_name: 'TEST_WORKFLOW',
    },
    body: {},
    actor: { id: 'TEST_ACTOR_ID' },
  }
  await start(request, reply)

  expect(mockRedis.get).toHaveBeenCalledTimes(1)
  expect(mockRedis.get).toHaveBeenCalledWith('workflows:TEST_WORKFLOW')

  expect(producer.send).toHaveBeenCalledTimes(1)
  expect(producer.send).toHaveBeenCalledWith({
    topic: 'orchestrator-start-process-topic',
    messages: [
      {
        value: JSON.stringify({
          input: {},
          workflow_name: 'TEST_WORKFLOW',
          actor: { id: 'TEST_ACTOR_ID' },
        }),
      },
    ],
  })

  expect(reply.code).toHaveBeenCalledWith(201)
  expect(reply.send).toHaveBeenCalledWith('OK')
})

it('should FAIL to START Process', async () => {
  const request = {
    params: {
      workflow_name: 'TEST_WORKFLOW',
    },
    body: {},
    actor: { id: 'TEST_ACTOR_ID' },
  }
  await start(request, reply)

  expect(mockRedis.get).toHaveBeenCalledTimes(1)
  expect(mockRedis.get).toHaveBeenCalledWith('workflows:TEST_WORKFLOW')

  expect(producer.send).toHaveBeenCalledTimes(0)

  expect(reply.code).toHaveBeenCalledWith(400)
  expect(reply.send).toHaveBeenCalledWith('NOK')
})

it('should run CONTINUE Process', async () => {
  const testProcess = { workflow_name: 'TEST_WORKFLOW' }
  mockRedis.set('process_history:TEST_PROCESS_ID', JSON.stringify(testProcess))
  const request = {
    params: {
      process_id: 'TEST_PROCESS_ID',
    },
    body: {},
    actor: { id: 'TEST_ACTOR_ID' },
  }
  await continue_(request, reply)

  expect(mockRedis.get).toHaveBeenCalledTimes(1)
  expect(mockRedis.get).toHaveBeenCalledWith('process_history:TEST_PROCESS_ID')

  expect(producer.send).toHaveBeenCalledTimes(1)
  expect(producer.send).toHaveBeenCalledWith({
    topic: 'orchestrator-continue-process-topic',
    messages: [
      {
        value: JSON.stringify({
          input: {},
          workflow_name: 'TEST_WORKFLOW',
          process_id: 'TEST_PROCESS_ID',
          actor: { id: 'TEST_ACTOR_ID' },
        }),
      },
    ],
  })

  expect(reply.code).toHaveBeenCalledWith(200)
  expect(reply.send).toHaveBeenCalledWith('OK')
})

it('should FAIL to CONTNUE Process', async () => {
  const request = {
    params: {
      process_id: 'TEST_PROCESS_ID',
    },
    body: {},
    actor: { id: 'TEST_ACTOR_ID' },
  }
  await continue_(request, reply)

  expect(mockRedis.get).toHaveBeenCalledTimes(1)
  expect(mockRedis.get).toHaveBeenCalledWith('process_history:TEST_PROCESS_ID')

  expect(producer.send).toHaveBeenCalledTimes(0)

  expect(reply.code).toHaveBeenCalledWith(400)
  expect(reply.send).toHaveBeenCalledWith('NOK')
})
