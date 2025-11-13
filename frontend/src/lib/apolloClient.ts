import {ApolloClient, InMemoryCache, HttpLink, from} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
import {onError} from '@apollo/client/link/error';
import {isTokenExpired} from './jwt';

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3001/',
});

const authLink = setContext((_, {headers}) => {
  const token = localStorage.getItem('authToken');

  // Check if token is expired before sending request
  if (token && isTokenExpired(token)) {
    console.warn('Token expired before request, triggering logout');

    // Clear auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    // Trigger logout event
    window.dispatchEvent(new CustomEvent('auth:logout'));

    // Don't include the expired token in the request
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

// Add error handling for auth failures
const errorLink = onError(({graphQLErrors}) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      // Check for authentication errors
      if (
        err.message.includes('Not authenticated') ||
        err.message.includes('JWT verification failed') ||
        err.message.includes('invalid signature') ||
        err.message.includes('jwt expired') ||
        err.extensions?.code === 'UNAUTHENTICATED'
      ) {
        console.warn('Authentication error detected, logging out user');

        // Clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');

        // Clear Apollo cache
        apolloClient.cache.evict({id: 'ROOT_QUERY'});
        apolloClient.cache.gc();

        // Trigger logout event
        window.dispatchEvent(new CustomEvent('auth:logout'));

        // Stop processing this request
        return;
      }
    }
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      User: {
        fields: {
          rare_candy: {
            // Ensure rare_candy is always stored and read as a string
            // This prevents Apollo from converting large number strings to numbers
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
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
