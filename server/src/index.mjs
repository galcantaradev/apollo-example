import { ApolloServer } from 'apollo-server';
import isEmail from 'isemail';

import { typeDefs } from './schema.mjs';
import { resolvers } from './resolvers.mjs';
import { createStore } from './utils.mjs';
import { LaunchAPI, UserAPI } from './datasource/index.mjs';

const store = createStore();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI({ store })
  }),
  context: async ({ req }) => {
    const auth = req.headers?.authorization || '';
    const email = Buffer.from(auth, 'base64').toString('ascii');

    if (!isEmail.validate(email)) {
      return { user: null };
    }

    const users = await store.users.findOrCreate({ where: { email } });
    const user = (users && users[0]) || null;

    return { user: { ...user.dataValues } };
  }
});

server
  .listen()
  .then(() => console.log('Server running on http://localhost:4000'));
