const { ApolloServer, gql } = require("apollo-server");
const { Prisma, extractFragmentReplacements } = require("prisma-binding");
const fetch = require(`node-fetch`);
const { HttpLink } = require(`apollo-link-http`);
const { Binding } = require(`graphql-binding`);
const {
  makeRemoteExecutableSchema,
  introspectSchema,
  mergeSchemas,
  makeExecutableSchema
} = require(`graphql-tools`);
const fs = require(`fs`);
require(`dotenv`).config();

// https://codesandbox.io/s/jzr68rzyv9

const typeDefs = gql`
  type Query {
    users: [User]
    messages: [Message]
    messagesByUser(userId: ID!): [Message]
  }

  type Mutation {
    sendMessage(userId: ID!, message: String): Message
    createUser(githubLogin: String): User
  }

  type Subscription {
    message: MessageSubscriptionPayload
  }

  type MessageSubscriptionPayload {
    node: Message
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
    createdAt: String
    user: User!
  }
`;

// A map of functions which return data for the schema.
const cache = {};
const resolvers = {
  Query: {
    users: (_, _x, { db }, info) => db.query.users({}, info),
    messages: (_, _x, { db }, info) => db.query.messages({}, info),
    messagesByUser: (parent, args, { db }, info) => {
      return db.query.messages({ where: { user: { id: args.userId } } }, info);
    }
  },
  Mutation: {
    createUser: async (_, { githubLogin }, { github, db }, info) => {
      // check for duplicate
      const user = await db.query.user({ where: { githubLogin } }, info);
      if (user) return user;

      const { avatarUrl: avatar, name } = await github.query.user(
        { login: githubLogin },
        `{ avatarUrl,  name }`
      );
      if (!avatar || !name) throw new Error("Avatar or Name not returned");
      return db.mutation.createUser(
        { data: { name, avatar, githubLogin } },
        info
      );
    },
    sendMessage: async (_, args, { db }, info) => {
      return db.mutation.createMessage(
        {
          data: {
            message: args.message,
            user: {
              connect: { id: args.userId }
            }
          }
        },
        info
      );
    }
  },
  Subscription: {
    message: {
      subscribe: async (parent, { userId }, { db }, info) => {
        return db.subscription.message({}, info);
      }
    }
  },
  User: {
    avatar: {
      fragment: `fragment getGithubLogin on User { githubLogin }`,
      resolve: async ({ githubLogin }, args, { github }) => {
        if (cache.githubLogin) return cache.githubLogin;
        const { avatarUrl } = await github.query.user(
          { login: githubLogin },
          `{ avatarUrl }`
        );
        cache[githubLogin] = avatarUrl;
        return avatarUrl;
      }
    }
  }
};

const fragmentReplacements = extractFragmentReplacements(resolvers);

const db = new Prisma({
  fragmentReplacements,
  typeDefs: `./generated/prisma.graphql`,
  endpoint: process.env.PRISMA_ENDPOINT,
  debug: true
});

const githubLink = new HttpLink({
  uri: `https://api.github.com/graphql`,
  headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
  fetch
});

const gitHubSchema = makeRemoteExecutableSchema({
  schema: fs.readFileSync(__dirname + `/../generated/github.graphql`, `utf-8`),
  link: githubLink
});

const github = new Binding({
  schema: gitHubSchema,
  fragmentReplacements
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: req => ({ ...req, db, github })
});

server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
