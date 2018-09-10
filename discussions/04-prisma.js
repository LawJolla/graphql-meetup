const { ApolloServer, gql } = require("apollo-server");
const { Prisma, extractFragmentReplacements } = require("prisma-binding");
require("dotenv").config();
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

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    users: (_, _x, { db }, info) => db.query.users({}, info),
    messages: (_, _x, { db }, info) => db.query.messages({}, info),
    messagesByUser: (parent, args, { db }, info) => {
      return db.query.messages({ where: { user: { id: args.userId } } }, info);
    }
  },
  Mutation: {
    sendMessage: (_, args, { db }, info) => {
      return null;
    }
  },
  Message: {
    user: (parent, args) => null
  },
  User: {
    messages: (parent, args) => null
  }
};

const fragmentReplacements = extractFragmentReplacements(resolvers);
const db = new Prisma({
  fragmentReplacements,
  typeDefs: `./generated/prisma.graphql`,
  endpoint: process.env.PRISMA_ENDPOINT,
  debug: true
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: req => ({ ...req, db })
});

server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
