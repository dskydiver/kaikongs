import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_APP_GRAPHQL_ENDPOINT,
  cache: new InMemoryCache(),
});

export default client;