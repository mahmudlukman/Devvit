import { apiSlice } from '../api/apiSlice';

export const questionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getQuestions: builder.query({
      query: () => ({
        url: 'questions',
        method: 'GET',
        credentials: 'include' as const,
      }),
    }),
    createQuestion: builder.mutation({
      query: (data) => ({
        url: 'create-question',
        method: 'POST',
        body: data,
        credentials: 'include' as const,
      }),
    }),
    getQuestion: builder.query({
      query: (id) => ({
        url: `question/${id}`,
        method: 'GET',
        credentials: 'include' as const,
      }),
    }),
    upvoteQuestion: builder.mutation({
      query: () => ({
        url: 'upvote-question',
        method: 'PUT',
        credentials: 'include' as const,
      }),
    }),
    downvoteQuestion: builder.mutation({
      query: () => ({
        url: 'downvote-question',
        method: 'PUT',
        credentials: 'include' as const,
      }),
    }),
    deleteQuestion: builder.mutation({
      query: (questionId) => ({
        url: `question/${questionId}`,
        method: 'DELETE',
        credentials: 'include' as const,
      }),
    }),
    editQuestion: builder.mutation({
      query: (questionId) => ({
        url: `edit-question/${questionId}`,
        method: 'PUT',
        credentials: 'include' as const,
      }),
    }),
    getHotQuestion: builder.query({
      query: () => ({
        url: 'hot-questions',
        method: 'GET',
        credentials: 'include' as const,
      }),
    }),
    getRecommendedQuestion: builder.query({
      query: () => ({
        url: 'recommended-questions',
        method: 'GET',
        credentials: 'include' as const,
      }),
    }),
  }),
});

export const {
  useGetQuestionsQuery,
  useCreateQuestionMutation,
  useGetQuestionQuery,
  useUpvoteQuestionMutation,
  useDownvoteQuestionMutation,
  useDeleteQuestionMutation,
  useEditQuestionMutation,
  useGetHotQuestionQuery,
  useGetRecommendedQuestionQuery
} = questionApi;
