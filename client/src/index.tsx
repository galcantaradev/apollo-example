import {
  ApolloClient,
  NormalizedCacheObject,
  ApolloProvider,
  gql,
  useQuery
} from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom';

import { cache } from './cache';
import Pages from './pages';
import Login from './pages/login';
import injectStyles from './styles';

export const typeDefs = gql`
  extend type Query {
    isLoggedIn: Boolean!
    cartItems: [ID!]!
  }
`;

const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    isLoggedIn @client
  }
`;

function IsLoggedIn() {
  const { data } = useQuery(IS_LOGGED_IN);
  return data.isLoggedIn ? <Pages /> : <Login />;
}

const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  cache,
  uri: 'http://localhost:4000/graphql',
  typeDefs,
  headers: {
    authorization: localStorage.getItem('token') || ''
  }
});

injectStyles();

const rootElement = (
  <ApolloProvider client={client}>
    <IsLoggedIn />
  </ApolloProvider>
);

const container = document.getElementById('root');

ReactDOM.render(rootElement, container);
