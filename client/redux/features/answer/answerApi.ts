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
      query: ({ questionId }) => ({
        url: `answers/${questionId}`,
        method: 'GET',
        credentials: 'include' as const,
      }),
    }),
  }),
});

export const { useCreateAnswerMutation, useGetAnswersQuery } = answerApi;
