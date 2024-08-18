import { apiSlice } from '../api/apiSlice';

export const questionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getQuestions: builder.query({
      query: () => ({
        url: 'get-questions',
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
        url: `get-question/${id}`,
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
  }),
});

export const {
  useGetQuestionsQuery,
  useCreateQuestionMutation,
  useGetQuestionQuery,
  useUpvoteQuestionMutation,
  useDownvoteQuestionMutation,
} = questionApi;
