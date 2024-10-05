import { apiSlice } from '../api/apiSlice';

export const interactionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getViewQuestion: builder.query({
      query: ({questionId}) => ({
        url: `view-question/${questionId}`,
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: (result, error, arg) => [
        { type: 'Interaction', id: `VIEW_${arg.questionId}` },
        { type: 'Question', id: arg.questionId },
      ],
    }),
  }),
});

export const { useGetViewQuestionQuery } = interactionApi;