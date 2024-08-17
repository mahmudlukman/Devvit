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
  }),
});

export const { useCreateAnswerMutation } = answerApi;
