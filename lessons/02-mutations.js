const { ApolloServer, gql } = require("apollo-server");

// The GraphQL schema
const typeDefs = gql`
  type Query {
    "A simple type for getting started!"
    hello: Hello
    goodbye: String
  }

  type Mutation {
    changeGreeting(newGreeting: String): Hello
  }

  type Hello {
    id: ID
    greeting: String
  }
`;

const Hello = {
  id: "12",
  greeting: "👋"
};

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    hello: () => Hello,
    goodbye: () => "✌️"
  },
  Mutation: {
    changeGreeting: (parent, args, context, info) => {
      Hello.greeting = args.newGreeting;
      return Hello;
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
