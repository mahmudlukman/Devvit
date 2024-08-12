import { apiSlice } from '../api/apiSlice';

export const tagsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTopInteractedTags: builder.query({
      query: (id) => ({
        url: `get-top-tags/${id}`,
        method: 'GET',
        credentials: 'include' as const,
      }),
    }),
  }),
});

export const { useGetTopInteractedTagsQuery } = tagsApi;
