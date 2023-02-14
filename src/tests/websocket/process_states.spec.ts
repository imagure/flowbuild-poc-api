import { processStateEmitter } from '@websocket/emitters/process_state'
import { EachMessagePayload } from 'kafkajs'
import { emitter } from '@websocket/tools/emitter'
import { processState } from '@websocket/listeners/process_state'
import { SocketStream } from '@fastify/websocket'
import { IActorRequest } from '@src/types'

jest.mock('@websocket/tools/emitter', () => {
  return {
    emitter: {
      emit: jest.fn(() => {}),
      on: jest.fn((_event, cb) => cb()),
      removeAllListeners: jest.fn(() => {}),
    },
  }
})

const socketOn = jest.fn((_event, cb) => cb())
const socketSend = jest.fn((_message) => {})
const connection = {
  socket: {
    on: socketOn,
    send: socketSend,
  },
} as unknown as SocketStream

const request = { actor: { id: 'TEST_ACTOR_ID' } } as unknown as IActorRequest

beforeEach(() => {
  jest.clearAllMocks()
})

describe('Emitter', () => {
  it('should emit message received on eachMessage', async () => {
    const value = '{"actor_id":"TEST_ACTOR_ID"}'
    const parsedValue = JSON.parse(value)
    await processStateEmitter({
      message: { value },
    } as unknown as EachMessagePayload)
    expect(emitter.emit).toHaveBeenCalledTimes(1)
    expect(emitter.emit).toHaveBeenCalledWith(
      `process_state_${parsedValue.actor_id}`,
      parsedValue
    )
  })

  it('should not emit invalid message', async () => {
    const value = 'not a JSON'
    await processStateEmitter({
      message: { value },
    } as unknown as EachMessagePayload)
    expect(emitter.emit).toHaveBeenCalledTimes(0)
  })
})

describe('Listener', () => {
  it('should listen to emitted event', async () => {
    processState.listener(connection, request)
    expect(socketOn).toHaveBeenCalledTimes(2)
    expect(socketSend).toHaveBeenCalledTimes(2)
    expect(emitter.on).toHaveBeenCalledTimes(1)
    expect(emitter.removeAllListeners).toHaveBeenCalledTimes(1)
  })

  it('should not properly connect without actor data', async () => {
    processState.listener(connection, {} as IActorRequest)
    expect(socketOn).toHaveBeenCalledTimes(0)
    expect(socketSend).toHaveBeenCalledTimes(0)
    expect(emitter.on).toHaveBeenCalledTimes(0)
    expect(emitter.removeAllListeners).toHaveBeenCalledTimes(0)
  })
})
