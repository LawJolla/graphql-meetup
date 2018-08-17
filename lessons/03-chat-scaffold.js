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
    email: String!
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
      name: "2Pac",
      email: "imalive@aol.com",
      avatar: "image"
    },
    {
      id: "2",
      name: "JayZ",
      email: "hova@aol.com",
      avatar: "image"
    }
  ],
  messages: [
    {
      id: "1",
      message: "I'm still in Vegas!",
      createdAt: "Today",
      user: "1"
    },
    {
      id: "2",
      message: "Heyyy",
      createdAt: "Today",
      user: "2"
    }
  ]
};

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    users: () => fakeDb.users,
    messages: () => fakeDb.messages,
    messagesByUser: (parent, args) => {
      return fakeDb.messages.filter(message => message.user === args.userId);
    }
  },
  Mutation: {
    sendMessage: (_, args) => {
      const newMessage = {
        id: `${fakeDb.messages.length + 1}`,
        message: args.message,
        createdAt: "Today",
        user: args.userId
      };
      fakeDb.messages.push(newMessage);
      console.log(fakeDb);
      return newMessage;
    }
  },
  Message: {
    user: (parent, args) => fakeDb.users.find(user => user.id === parent.user)
  },
  User: {
    messages: (parent, args) =>
      fakeDb.messages.filter(message => message.user === parent.id)
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
