import { paginateResults } from './utils.mjs';

export const resolvers = {
  Query: {
    launches: async (parent, args, context, info) => {
      const { launchAPI } = context.dataSources;
      const { pageSize = 20, after } = args;
      const allLaunches = await launchAPI.getAllLaunches();
      // we want these in reverse chronological order
      allLaunches.reverse();
      const launches = paginateResults({
        after,
        pageSize,
        results: allLaunches
      });

      return {
        launches,
        cursor: launches.length ? launches[launches.length - 1].cursor : null,
        // if the cursor at the end of the paginated results is the same as the
        // last item in _all_ results, then there are no more results after this
        hasMore: launches.length
          ? launches[launches.length - 1].cursor !==
            allLaunches[allLaunches.length - 1].cursor
          : false
      };
    },
    launch: (parent, args, context, info) => {
      const { id } = args;
      const { dataSources } = context;

      return dataSources.launchAPI.getLaunchById({ launchId: id });
    },
    me: (parent, args, context) => {
      const { dataSources } = context;

      return dataSources.userAPI.findOrCreateUser();
    }
  },
  Mutation: {
    login: async (parent, args, context, info) => {
      const { email } = args;
      const { userAPI } = context.dataSources;

      const user = await userAPI.findOrCreateUser({ email });
      if (user) {
        user.token = Buffer.from(email).toString('base64');
        return user;
      }
    },
    bookTrips: async (parent, args, context, info) => {
      const { launchIds } = args;
      const { launchAPI, userAPI } = context.dataSources;

      const results = await userAPI.bookTrips({ launchIds });
      const launches = await launchAPI.getLaunchesByIds({ launchIds });

      return {
        success: results && results.length === launchIds.length,
        message:
          results.length === launchIds.length
            ? 'trips booked successfully'
            : `the following launches couldn't be booked: ${launchIds.filter(
                id => !results.includes(id)
              )}`,
        launches
      };
    },
    cancelTrip: async (parent, args, context, info) => {
      const { launchId } = args;
      const { userAPI, launchAPI } = context.dataSources;
      const result = await userAPI.cancelTrip({ launchId });

      if (!result)
        return {
          success: false,
          message: 'failed to cancel trip'
        };

      const launch = await launchAPI.getLaunchById({ launchId });
      return {
        success: true,
        message: 'trip cancelled',
        launches: [launch]
      };
    }
  },
  Mission: {
    missionPatch: (mission, args) => {
      const { size } = args.size || 'LARGE';

      return size === 'SMALL'
        ? mission.missionPatchSmall
        : mission.missionPatchLarge;
    }
  },
  Launch: {
    isBooked: async (launch, args, context) => {
      const { userAPI } = context.dataSources;

      return userAPI.isBookedOnLaunch({ launchId: launch.id });
    }
  },
  User: {
    trips: async (user, args, context) => {
      const { userAPI, launchAPI } = context.dataSources;
      const launchIds = await userAPI.getLaunchIdsByUser();

      if (!launchIds.length) {
        return [];
      }

      return launchAPI.getLaunchesByIds({ launchIds }) || [];
    }
  }
};
