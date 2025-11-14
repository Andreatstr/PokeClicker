/**
 * Apollo Client Configuration
 *
 * Configures Apollo Client with authentication, error handling, and caching strategies.
 * Uses a link chain architecture: errorLink -> authLink -> httpLink
 * This order ensures errors are caught first, then auth is added, then the request is sent.
 */

import {ApolloClient, InMemoryCache, HttpLink, from} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
import {onError} from '@apollo/client/link/error';
import {isTokenExpired} from './jwt';
import {logger} from './logger';

/**
 * HTTP Link - Terminal link that sends GraphQL operations to the server
 * Uses environment variable for flexible deployment (dev/prod)
 */
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3001/',
});

/**
 * Auth Link - Adds JWT authentication to every request
 *
 * Proactively checks token expiration before sending requests to avoid
 * unnecessary server roundtrips with expired tokens. This improves performance
 * and user experience by immediately triggering logout flow.
 */
const authLink = setContext((_, {headers}) => {
  const token = localStorage.getItem('authToken');

  // Proactive token validation prevents sending expired tokens to server
  if (token && isTokenExpired(token)) {
    logger.warn(
      '[ApolloClient] Token expired before request, triggering logout'
    );

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    // Custom event allows auth context to react without circular dependencies
    window.dispatchEvent(new CustomEvent('auth:logout'));

    return {
      headers: {
        ...headers,
      },
    };
  }

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

/**
 * Error Link - Centralized error handling for authentication failures
 *
 * Catches authentication errors from server (e.g., token validation failures)
 * and triggers logout flow. This handles cases where the token passes client-side
 * validation but fails server-side verification.
 */
const errorLink = onError(({graphQLErrors}) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (
        err.message.includes('Not authenticated') ||
        err.message.includes('JWT verification failed') ||
        err.message.includes('invalid signature') ||
        err.message.includes('jwt expired') ||
        err.extensions?.code === 'UNAUTHENTICATED'
      ) {
        logger.warn(
          '[ApolloClient] Authentication error detected, logging out user'
        );

        localStorage.removeItem('authToken');
        localStorage.removeItem('user');

        // Cache invalidation: Clear all cached queries to prevent stale authenticated data
        apolloClient.cache.evict({id: 'ROOT_QUERY'});
        apolloClient.cache.gc(); // Garbage collection removes unreferenced cache entries

        window.dispatchEvent(new CustomEvent('auth:logout'));

        return;
      }
    }
  }
});

/**
 * Apollo Client Instance
 *
 * Cache Strategy: cache-first for optimal performance
 * - Reads from cache before network, reducing server load
 * - Ideal for Pokemon data which rarely changes
 * - Can use refetch() or network-only for real-time data when needed
 *
 * Error Policy: all
 * - Returns both data and errors, allowing partial UI updates
 * - Better UX than failing the entire request for partial errors
 */
export const apolloClient = new ApolloClient({
  // Link chain: error handling -> auth injection -> network request
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      User: {
        fields: {
          rare_candy: {
            /**
             * Custom merge function for rare_candy field
             *
             * Forces string storage to prevent JavaScript number precision issues
             * with large integers (>2^53). This is critical for incremental games
             * where candy counts can grow exponentially.
             */
            merge(_existing, incoming) {
              return String(incoming);
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first', // Prioritize cache for reactive queries
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'cache-first', // Prioritize cache for one-time queries
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
