const { ApolloServer, gql } = require("apollo-server");

// The GraphQL schema
const typeDefs = gql`
  type Query {
    "A simple type for getting started!"
    hello: Hello
    goodbye: String
  }

  type Hello {
    id: ID
    greeting: String
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    hello: () => ({ id: "1", greeting: "👋" }),
    goodbye: () => "✌️"
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
