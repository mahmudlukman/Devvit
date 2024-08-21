import { apiSlice } from '../api/apiSlice';

export const interactionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getViewQuestion: builder.query({
      query: (questionId) => ({
        url: `view-question${questionId}`,
        method: 'GET',
        credentials: 'include' as const,
      }),
    }),
  }),
});

export const { useGetViewQuestionQuery } = interactionApi;
