import { apiSlice } from '../api/apiSlice';

export const answerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createAnswer: builder.mutation({
      query: (data) => ({
        url: 'create-answer',
        method: 'POST',
        body: data,
        credentials: 'include' as const,
      }),
    }),
    getAnswers: builder.query({
      query: () => ({
        url: 'answers',
        method: 'GET',
        credentials: 'include' as const,
      }),
    }),
    upvoteAnswer: builder.mutation({
      query: () => ({
        url: 'upvote-answer',
        method: 'PUT',
        credentials: 'include' as const,
      }),
    }),
    downvoteAnswer: builder.mutation({
      query: () => ({
        url: 'downvote-answer',
        method: 'PUT',
        credentials: 'include' as const,
      }),
    }),
    deleteAnswer: builder.mutation({
      query: (answerId) => ({
        url: `delete-answer/${answerId}`,
        method: 'DELETE',
        credentials: 'include' as const,
      }),
    }),
  }),
});

export const {
  useCreateAnswerMutation,
  useGetAnswersQuery,
  useDeleteAnswerMutation,
  useDownvoteAnswerMutation,
  useUpvoteAnswerMutation,
} = answerApi;
