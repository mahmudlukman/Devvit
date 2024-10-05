import { apiSlice } from '../api/apiSlice';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserInfo: builder.query({
      query: ({ userId }) => ({
        url: `user-info/${userId}`,
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: (result, error, arg) => [{ type: 'User', id: arg.userId }],
    }),
    getAllUsers: builder.query({
      query: () => ({
        url: 'users',
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }: any) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),
    updateUserProfile: builder.mutation({
      query: ({ data }) => ({
        url: 'update-user-profile',
        method: 'PUT',
        body: data,
        credentials: 'include' as const,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'User', id: arg.data.id },
        { type: 'User', id: 'LIST' },
      ],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `delete-user/${id}`,
        method: 'DELETE',
        credentials: 'include' as const,
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),
    getSavedQuestions: builder.query({
      query: ({ userId }) => ({
        url: `saved-questions/${userId}`,
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }: any) => ({
                type: 'Question' as const,
                id,
              })),
              { type: 'Question', id: 'SAVED_LIST' },
              { type: 'User', id: 'SAVED_QUESTIONS' },
            ]
          : [{ type: 'Question', id: 'SAVED_LIST' }, { type: 'User', id: 'SAVED_QUESTIONS' }],
    }),
    toggleSavedQuestion: builder.mutation({
      query: (questionId) => ({
        url: `toggle-save-question/${questionId}`,
        method: 'POST',
        credentials: 'include' as const,
      }),
      invalidatesTags: (result, error, questionId) => [
        { type: 'Question', id: questionId },
        { type: 'Question', id: 'SAVED_LIST' },
        { type: 'User', id: 'SAVED_QUESTIONS' },
      ],
    }),
    getUserAnswers: builder.query({
      query: () => ({
        url: 'user-answers',
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }: any) => ({ type: 'Answer' as const, id })),
              { type: 'Answer', id: 'USER_LIST' },
              { type: 'User', id: 'USER_ANSWERS' },
            ]
          : [{ type: 'Answer', id: 'USER_LIST' }, { type: 'User', id: 'USER_ANSWERS' }],
    }),
    getUserQuestions: builder.query({
      query: () => ({
        url: 'user-questions',
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }: any) => ({
                type: 'Question' as const,
                id,
              })),
              { type: 'Question', id: 'USER_LIST' },
              { type: 'User', id: 'USER_QUESTIONS' },
            ]
          : [{ type: 'Question', id: 'USER_LIST' }, { type: 'User', id: 'USER_QUESTIONS' }],
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