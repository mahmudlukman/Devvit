import { apiSlice } from '../api/apiSlice';
import {getQuestionsFromResult} from '../../helper'

export const questionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getQuestions: builder.query({
      query: (params) => ({
        url: 'questions',
        method: 'GET',
        params: {
          searchQuery: params.searchQuery,
          filter: params.filter,
          page: params.page,
          pageSize: params.pageSize
        },
        credentials: 'include' as const,
      }),
      providesTags: (result) => [
        ...getQuestionsFromResult(result),
        { type: 'Question', id: 'LIST' },
      ],
    }),
    createQuestion: builder.mutation({
      query: (data) => ({
        url: 'create-question',
        method: 'POST',
        body: data,
        credentials: 'include' as const,
      }),
      invalidatesTags: [{ type: 'Question', id: 'LIST' }],
    }),
    getQuestion: builder.query({
      query: ({questionId}) => ({
        url: `question/${questionId}`,
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: (result, error, arg) => [{ type: 'Question', id: arg.questionId }],
    }),
    upvoteQuestion: builder.mutation({
      query: ({questionId, data}) => ({
        url: `upvote-question/${questionId}`,
        method: 'PUT',
        body: data,
        credentials: 'include' as const,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Question', id: arg.questionId }],
    }),
    downvoteQuestion: builder.mutation({
      query: ({questionId, data}) => ({
        url: `downvote-question/${questionId}`,
        method: 'PUT',
        body: data,
        credentials: 'include' as const,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Question', id: arg.questionId }],
    }),
    deleteQuestion: builder.mutation({
      query: (questionId) => ({
        url: `question/${questionId}`,
        method: 'DELETE',
        credentials: 'include' as const,
      }),
      invalidatesTags: (result, error, questionId) => [
        { type: 'Question', id: questionId },
        { type: 'Question', id: 'LIST' },
      ],
    }),
    editQuestion: builder.mutation({
      query: ({questionId, ...data}) => ({
        url: `edit-question/${questionId}`,
        method: 'PUT',
        body: data,
        credentials: 'include' as const,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Question', id: arg.questionId }],
    }),
    getHotQuestions: builder.query({
      query: () => ({
        url: 'hot-questions',
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: (result) => [
        ...getQuestionsFromResult(result),
        { type: 'Question', id: 'HOT_LIST' },
      ],
    }),
    getRecommendedQuestions: builder.query({
      query: () => ({
        url: 'recommended-questions',
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: (result) => [
        ...getQuestionsFromResult(result),
        { type: 'Question', id: 'RECOMMENDED_LIST' },
      ],
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
  useGetHotQuestionsQuery,
  useGetRecommendedQuestionsQuery,
} = questionApi;