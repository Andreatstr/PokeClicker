import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';
import { connectToDatabase, closeDatabaseConnection } from './db.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

async function startServer() {
  // Connect to MongoDB
  await connectToDatabase();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
  });

  console.log(`GraphQL server ready at: ${url}`);
  console.log(`Health check available at: ${url}?query={health{status,timestamp}}`);
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await closeDatabaseConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await closeDatabaseConnection();
  process.exit(0);
});

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
