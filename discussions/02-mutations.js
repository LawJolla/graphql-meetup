const { ApolloServer, gql } = require("apollo-server");

// The GraphQL schema
const typeDefs = gql`
  type Query {
    "A simple type for getting started!"
    hello: Hello
    goodbye: String
  }

  # add mutation for changeGreeting

  type Hello {
    id: ID
    greeting: String
  }
`;

// add greeting object

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    hello: () => ({ id: "1", greeting: "👋" }),
    goodbye: () => "✌️"
  }
  // add change greeting mutation resolver
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
