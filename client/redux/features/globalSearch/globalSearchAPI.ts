import { apiSlice } from '../api/apiSlice';

export const globalSearchApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    globalSearch: builder.query({
      query: (params) => ({
        url: 'global-search',
        method: 'GET',
        params: {
            query: params.query,
            type: params.type
        },
      }),
    }),
  }),
});

export const { useGlobalSearchQuery } = globalSearchApi;