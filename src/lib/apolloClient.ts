import {ApolloClient, InMemoryCache, HttpLink, from} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';

const httpLink = new HttpLink({
  uri: 'http://localhost:3001/',
});

const authLink = setContext((_, {headers}) => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
  },
});
