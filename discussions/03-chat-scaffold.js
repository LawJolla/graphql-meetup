const { ApolloServer, gql } = require("apollo-server");

// The GraphQL schema
const typeDefs = gql`
  type Query {
    users: [User]
    messages: [Message]
    messagesByUser(userId: ID!): [Message]
  }

  type Mutation {
    sendMessage(userId: ID!, message: String): Message
  }

  type User {
    id: ID!
    name: String!
    githubLogin: String!
    avatar: String!
    messages: [Message]
  }

  type Message {
    id: ID!
    message: String!
    createdAt: String!
    user: User!
  }
`;

const fakeDb = {
  users: [
    {
      id: "1",
      name: "Dennis",
      githubLogin: "LawJolla",
      avatar: "https://avatars3.githubusercontent.com/u/17485128?s=460&v=4"
    },
    {
      id: "2",
      name: "Ken Wheeler",
      githubLogin: "kenwheeler",
      avatar: "https://avatars3.githubusercontent.com/u/286616?s=400&v=4"
    }
  ],
  messages: [
    {
      id: "1",
      message: "I love GraphQL",
      createdAt: "Today",
      user: "1"
    },
    {
      id: "2",
      message: "I love Miller Lite",
      createdAt: "Today",
      user: "2"
    }
  ]
};

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    users: () => null,
    messages: () => null,
    messagesByUser: (_, args) => null
  },
  Mutation: {
    sendMessage: (_, args) => {
      const newMessage = {
        id: `${fakeDb.messages.length + 1}`,
        message: args.message,
        createdAt: "Today",
        user: args.userId
      };
      return null;
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
