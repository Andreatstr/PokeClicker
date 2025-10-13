import 'dotenv/config';
import {ApolloServer} from '@apollo/server';
import {startStandaloneServer} from '@apollo/server/standalone';
import {typeDefs} from './schema.js';
import {resolvers} from './resolvers.js';
import {connectToDatabase, closeDatabaseConnection} from './db.js';
import {initializeSchema} from './initSchema.js';
import {authenticateToken, type AuthContext} from './auth.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

async function startServer() {
  // Connect to MongoDB
  try {
    const db = await connectToDatabase();
    await initializeSchema(db);
  } catch (error) {
    console.warn('MongoDB connection failed, running without database:', error);
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const {url} = await startStandaloneServer(server, {
    listen: {port: PORT},
    context: async ({req}): Promise<AuthContext> => {
      // Extract Authorization header
      const authHeader = req.headers.authorization;

      // Verify token and extract user
      const user = authenticateToken(authHeader);

      return {user};
    },
  });

  console.log(`GraphQL server ready at: ${url}`);
  console.log(
    `Health check available at: ${url}?query={health{status,timestamp}}`
  );
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
