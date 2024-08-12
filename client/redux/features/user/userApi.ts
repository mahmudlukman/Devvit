import { apiSlice } from '../api/apiSlice';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSavedQuestions: builder.query({
      query: () => ({
        url: 'get-questions',
        method: 'GET',
        credentials: 'include' as const,
      }),
    }),
    getAllUsers: builder.query({
      query: () => ({
        url: 'get-users',
        method: 'GET',
        credentials: 'include' as const,
      }),
    }),
  }),
});

export const { useGetSavedQuestionsQuery, useGetAllUsersQuery } = userApi;
