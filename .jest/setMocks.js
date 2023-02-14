jest.mock('@swagger', () => {
  return {
    swagger: (_fastify) => { }
  }
})

jest.mock('@kafka', () => {
  return {
    connect: async () => {
      return {
        consumer: {
          run: () => { },
        },
        producer: {
          send: jest.fn(() => { })
        },
      }
    },
  }
})

jest.mock('@fastify/redis', () => {
  return (_f, _o, done) => {
    done()
  }
})

jest.mock('@auth', () => {
  return {
    verifyJWT: jest.fn(async (
      request,
      _reply,
      _done
    ) => {
      request.actor = { id: 'test_actor_id' }
      return
    })
  }
})