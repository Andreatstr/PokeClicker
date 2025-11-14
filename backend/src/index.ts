import 'dotenv/config';
import {ApolloServer} from '@apollo/server';
import {startStandaloneServer} from '@apollo/server/standalone';
import {typeDefs} from './schema.js';
import {resolvers} from './resolvers.js';
import {connectToDatabase, closeDatabaseConnection} from './db.js';
import {initializeSchema} from './initSchema.js';
import {authenticateToken, type AuthContext} from './auth.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// Rate limiting configuration
// Default: 1000 requests per 15 minutes per IP
const RATE_LIMIT_WINDOW = parseInt(
  process.env.RATE_LIMIT_WINDOW_MS || '900000'
);
const RATE_LIMIT_MAX_REQUESTS = parseInt(
  process.env.RATE_LIMIT_MAX_REQUESTS || '1000'
);

/**
 * In-memory rate limiting store
 * Maps IP addresses to their request count and reset timestamp
 * Note: Using in-memory storage means rate limits reset on server restart
 */
const rateLimitStore = new Map<string, {count: number; resetTime: number}>();

/**
 * Periodic cleanup to prevent memory leaks
 * Runs every 15 minutes to remove expired rate limit entries
 */
setInterval(
  () => {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      rateLimitStore.delete(key);
    }

    if (expiredKeys.length > 0) {
      console.log(
        `[RateLimiter] Cleaned up ${expiredKeys.length} expired entries`
      );
    }
  },
  15 * 60 * 1000
);

/**
 * Checks if an IP address has exceeded the rate limit
 * Implements a sliding window counter strategy
 *
 * @param ip - Client IP address
 * @returns true if request is allowed, false if rate limit exceeded
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = ip;
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  current.count++;
  rateLimitStore.set(key, current);
  return true;
}

/**
 * Initializes and starts the Apollo GraphQL server
 * Sets up database connection, rate limiting, and authentication
 */
async function startServer() {
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
              // Extract client IP from proxy headers or direct connection
              const ip =
                requestContext.request.http?.headers.get('x-forwarded-for') ||
                requestContext.request.http?.headers.get('x-real-ip') ||
                'unknown';

              // Health checks bypass rate limiting to ensure monitoring works
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
    listen: {port: PORT, host: '0.0.0.0'},
    context: async ({req}): Promise<AuthContext> => {
      const authHeader = req.headers.authorization;
      const user = authenticateToken(authHeader);

      return {user};
    },
  });

  console.log(`GraphQL server ready at: ${url}`);
  console.log(
    `Health check available at: ${url}?query={health{status,timestamp}}`
  );
}

/**
 * Graceful shutdown handlers
 * Ensures database connections are properly closed before exit
 */
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
