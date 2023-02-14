jest.mock('@swagger', () => {
  return {
    swagger: (_fastify) => { }
  }
})

jest.mock('@kafka', () => {
  return {
    connect: () => {
      return {
        consumer: {
          run: () => { },
        },
        producer: {},
      }
    },
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