const { ApolloServer, gql } = require("apollo-server");

// The GraphQL schema
const typeDefs = gql`
  type Query {
    "A simple type for getting started!"
    hello: String
    # goodbye with String
  }

  #  build hello type with id and greeting
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    // add hello type to hello query
    hello: () => "👋"
    // add goodbye resolver
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
