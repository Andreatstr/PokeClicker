export const resolvers = {
  Query: {
    health: () => ({
      status: 'OK',
      timestamp: new Date().toISOString(),
    }),
    hello: () => 'Hello from PokéClicker GraphQL API!',
  },
};
