import { InMemoryCache, Reference, makeVar } from '@apollo/client';

// Initializes to true if localStorage includes a 'token' key,
// false otherwise
export const isLoggedInVar = makeVar<boolean>(!!localStorage.getItem('token'));

// Initializes to an empty array
export const cartItemsVar = makeVar<string[]>([]);

export const cache: InMemoryCache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        launches: {
          keyArgs: false,
          merge(existing, incoming) {
            let launches: Reference[] = [];

            if (existing?.launches) {
              launches = launches.concat(existing.launches);
            }

            if (incoming?.launches) {
              launches = launches.concat(incoming.launches);
            }

            return {
              ...incoming,
              launches
            };
          }
        },
        isLoggedIn: {
          read() {
            return isLoggedInVar();
          }
        },
        cartItems: {
          read() {
            return cartItemsVar();
          }
        }
      }
    }
  }
});
