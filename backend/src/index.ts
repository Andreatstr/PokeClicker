import 'dotenv/config';
import {ApolloServer} from '@apollo/server';
import {startStandaloneServer} from '@apollo/server/standalone';
import {typeDefs} from './schema.js';
import {resolvers} from './resolvers.js';
import {connectToDatabase, closeDatabaseConnection} from './db.js';
import {initializeSchema} from './initSchema.js';
import {authenticateToken, type AuthContext} from './auth.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

const RATE_LIMIT_WINDOW = parseInt(
  process.env.RATE_LIMIT_WINDOW_MS || '900000'
);
const RATE_LIMIT_MAX_REQUESTS = parseInt(
  process.env.RATE_LIMIT_MAX_REQUESTS || '1000'
);

// Adaptive filter faceting configuration
// Controls when to use dynamic vs static filter counts based on dataset size
// For small datasets: compute counts dynamically per request (updates with filters)
// For large datasets: use precomputed static counts (global, doesn't update)
export const DYNAMIC_FACET_THRESHOLD = parseInt(
  process.env.DYNAMIC_FACET_THRESHOLD || '10000'
); // Use dynamic facets if total Pokemon <= this value
export const FACET_TIMEOUT_MS = parseInt(process.env.FACET_TIMEOUT_MS || '100'); // Max time (ms) for facet aggregation before falling back to static counts
export const USE_STATIC_FALLBACK = process.env.USE_STATIC_FALLBACK !== 'false'; // Enable fallback to precomputed static counts

// Simple in-memory rate limiting store
const rateLimitStore = new Map<string, {count: number; resetTime: number}>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = ip;
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    // Reset or initialize
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  // Increment counter
  current.count++;
  rateLimitStore.set(key, current);
  return true;
}

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
    plugins: [
      {
        async requestDidStart() {
          return {
            async willSendResponse(requestContext) {
              // Apply rate limiting to GraphQL requests
              const ip =
                requestContext.request.http?.headers.get('x-forwarded-for') ||
                requestContext.request.http?.headers.get('x-real-ip') ||
                'unknown';

              // Skip rate limiting for health checks
              if (requestContext.request.query?.includes('health')) {
                return;
              }

              if (!checkRateLimit(ip)) {
                throw new Error(
                  'Rate limit exceeded. Please slow down your requests.'
                );
              }
            },
          };
        },
      },
    ],
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
