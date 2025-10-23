import { render } from '@testing-library/react'
import { ApolloProvider } from '@apollo/client'
import { AuthProvider } from '@features/auth'
import { apolloClient } from '@lib/apolloClient'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <ApolloProvider client={apolloClient}>
        {children}
      </ApolloProvider>
    </AuthProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: any
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
