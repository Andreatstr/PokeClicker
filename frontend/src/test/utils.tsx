/**
 * Testing utilities
 * Custom render function that wraps components with Auth and Apollo providers
 */

import {render as rtlRender, type RenderOptions} from '@testing-library/react';
import {ApolloProvider} from '@apollo/client';
import {AuthProvider} from '@features/auth';
import {apolloClient} from '@lib/apolloClient';

function AllTheProviders({children}: {children: React.ReactNode}) {
  return (
    <AuthProvider>
      <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
    </AuthProvider>
  );
}

export function render(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return rtlRender(ui, {wrapper: AllTheProviders, ...options});
}

export * from '@testing-library/react';
