import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
  });

  console.log(`🚀 GraphQL server ready at: ${url}`);
  console.log(`📊 Health check available at: ${url}?query={health{status,timestamp}}`);
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
