/**
 * Application entry point
 * Sets up provider hierarchy: Error > Auth > Apollo > Onboarding > CandyOperations > App
 */

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ApolloProvider} from '@apollo/client';
import './index.css';
import App from './App.tsx';
import {apolloClient} from '@lib/apolloClient';
import {AuthProvider} from '@features/auth';
import {ErrorProvider} from '@/contexts/ErrorContext';
import {OnboardingProvider} from '@/contexts/OnboardingContext';
import {CandyOperationsProvider} from '@/contexts/CandyOperationsContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorProvider>
      <AuthProvider>
        <ApolloProvider client={apolloClient}>
          <OnboardingProvider>
            <CandyOperationsProvider>
              <App />
            </CandyOperationsProvider>
          </OnboardingProvider>
        </ApolloProvider>
      </AuthProvider>
    </ErrorProvider>
  </StrictMode>
);
