import { apiSlice } from '../api/apiSlice';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserInfo: builder.query({
      query: ({ userId }) => ({
        url: `user-info/${userId}`,
        method: 'GET',
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
    updateUserProfile: builder.mutation({
      query: (data) => ({
        url: 'update-user-profile',
        method: 'PUT',
        body: data,
        credentials: 'include' as const,
      }),
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `delete-user/${id}`,
        method: 'DELETE',
        credentials: 'include' as const,
      }),
    }),
    getSavedQuestions: builder.query({
      query: ({ userId }) => ({
        url: `saved-questions/${userId}`,
        method: 'GET',
        credentials: 'include' as const,
      }),
    }),
    toggleSavedQuestion: builder.mutation({
      query: (questionId) => ({
        url: `toggle-save-question/${questionId}`,
        method: 'POST',
        credentials: 'include' as const,
      }),
    }),
    getUserAnswers: builder.query({
      query: () => ({
        url: 'user-answers',
        method: 'GET',
        credentials: 'include' as const,
      }),
    }),
    getUserQuestions: builder.query({
      query: () => ({
        url: 'user-questions',
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
  useDeleteUserMutation,
  useGetUserAnswersQuery,
  useGetUserQuestionsQuery,
  useUpdateUserProfileMutation,
} = userApi;
