import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ApolloProvider} from '@apollo/client';
import './index.css';
import App from './App.tsx';
import {apolloClient} from '@lib/apolloClient';
import {AuthProvider} from '@features/auth';
import {ErrorProvider} from '@/contexts/ErrorContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorProvider>
      <AuthProvider>
        <ApolloProvider client={apolloClient}>
          <App />
        </ApolloProvider>
      </AuthProvider>
    </ErrorProvider>
  </StrictMode>
);
