jest.mock('@swagger', () => {
  return {
    swagger: (fastify) => { }
  }
})