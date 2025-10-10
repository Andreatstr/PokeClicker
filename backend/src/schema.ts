export const typeDefs = `#graphql
  type Query {
    health: HealthCheck!
    hello: String!
  }

  type HealthCheck {
    status: String!
    timestamp: String!
  }
`;
