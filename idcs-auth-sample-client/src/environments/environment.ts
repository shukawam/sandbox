// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  idcs_base_url: 'https://idcs-f0017ddeef0241cfbd70e057c032ff44.identity.oraclecloud.com',
  client_id: 'ae777aecc5bb4d83a511990c465238b3',
  client_secret: '5f77ab91-24e9-4a55-93e2-8a2e498f90c1',
  base64url_encoded_credential: 'YWU3NzdhZWNjNWJiNGQ4M2E1MTE5OTBjNDY1MjM4YjM6NWY3N2FiOTEtMjRlOS00YTU1LTkzZTItOGEyZTQ5OGY5MGMx',
  redirect_url: 'http://localhost:4200/item-search',
  item_search_endpoint: '/api/v1/items',
  item_create_endpoint: '/api/v1/items'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
