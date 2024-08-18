import { apiSlice } from '../api/apiSlice';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSavedQuestions: builder.query({
      query: ({ userId }) => ({
        url: `saved-questions/${userId}`,
        method: 'GET',
        credentials: 'include' as const,
      }),
    }),
    toggleSavedQuestion: builder.mutation({
      query: () => ({
        url: 'toggle-save-question',
        method: 'POST',
        credentials: 'include' as const,
      }),
    }),
    getAllUsers: builder.query({
      query: () => ({
        url: 'users',
        method: 'GET',
        credentials: 'include' as const,
      }),
    }),
    getUserInfo: builder.query({
      query: ({ userId }) => ({
        url: `user-info/${userId}`,
        method: 'GET',
        credentials: 'include' as const,
      }),
    }),
  }),
});

export const {
  useGetSavedQuestionsQuery,
  useGetAllUsersQuery,
  useToggleSavedQuestionMutation,
  useGetUserInfoQuery,
} = userApi;
