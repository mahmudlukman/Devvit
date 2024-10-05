import { apiSlice } from '../api/apiSlice';
import {getAnswersFromResult} from '../../helper'

export const answerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createAnswer: builder.mutation({
      query: (data) => ({
        url: 'create-answer',
        method: 'POST',
        body: data,
        credentials: 'include' as const,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Answer', id: 'LIST' },
        { type: 'Question', id: arg.questionId },
      ],
    }),
    getAnswers: builder.query({
      query: (params) => ({
        url: 'answers',
        method: 'GET',
        params: {
          questionId: params.questionId,
          sortBy: params.sortBy,
          page: params.page,
          pageSize: params.pageSize
        },
        credentials: 'include' as const,
      }),
      providesTags: (result) => [
        ...getAnswersFromResult(result),
        { type: 'Answer', id: 'LIST' },
      ],
    }),
    upvoteAnswer: builder.mutation({
      query: ({answerId}) => ({
        url: `upvote-answer/${answerId}`,
        method: 'PUT',
        credentials: 'include' as const,
      }),
      invalidatesTags: (result, error, answerId) => [{ type: 'Answer', id: answerId }],
    }),
    downvoteAnswer: builder.mutation({
      query: ({answerId}) => ({
        url: `downvote-answer/${answerId}`,
        method: 'PUT',
        credentials: 'include' as const,
      }),
      invalidatesTags: (result, error, answerId) => [{ type: 'Answer', id: answerId }],
    }),
    deleteAnswer: builder.mutation({
      query: ({answerId}) => ({
        url: `delete-answer/${answerId}`,
        method: 'DELETE',
        credentials: 'include' as const,
      }),
      invalidatesTags: (result, error, answerId) => [
        { type: 'Answer', id: answerId },
        { type: 'Answer', id: 'LIST' },
      ],
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