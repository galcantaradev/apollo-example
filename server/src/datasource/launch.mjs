import { RESTDataSource } from 'apollo-datasource-rest';

export class LaunchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://api.spacexdata.com/v2/';
  }

  async getAllLaunches() {
    const response = await this.get('launches');
    return Array.isArray(response) ? response.map(this.reduceLaunch) : [];
  }

  async getLaunchById(launchId) {
    const response = await this.get('launches', { flight_number: launchId });
    return response[0] ? this.reduceLaunch(response[0]) : null;
  }

  getLaunchesByIds({ launchIds }) {
    return Promise.all(
      launchIds.map(launchId => this.getLaunchById({ launchId })) || []
    );
  }

  reduceLaunch = launch => {
    return {
      id: launch.flight_number || 0,
      cursor: `${launch.launch_date_unix}`,
      site: launch.launch_site && launch.launch_site.site_name,
      mission: {
        name: launch.mission_name,
        missionPatchSmall: launch.links.mission_patch_small,
        missionPatchLarge: launch.links.mission_patch
      },
      rocket: {
        id: launch.rocket.rocket_id,
        name: launch.rocket.rocket_name,
        type: launch.rocket.rocket_type
      }
    };
  };
}
