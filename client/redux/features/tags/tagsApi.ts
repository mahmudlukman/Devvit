import { apiSlice } from '../api/apiSlice';
import {getTagsFromResult} from '../../helper'

export const tagsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTopInteractedTags: builder.query({
      query: (id) => ({
        url: `top-tags/${id}`,
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: (result) => [
        ...getTagsFromResult(result),
        { type: 'Tags', id: 'TOP_INTERACTED' },
      ],
    }),
    getAllTags: builder.query({
      query: () => ({
        url: 'tags',
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: (result) => [
        ...getTagsFromResult(result),
        { type: 'Tags', id: 'LIST' },
      ],
    }),
    getQuestionByTags: builder.query({
      query: ({tagId}) => ({
        url: `question-by-tag/${tagId}`,
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: (result, error, tagId) => [
        { type: 'Tags', id: tagId },
        { type: 'Question', id: 'BY_TAG' },
      ],
    }),
    getPopularTags: builder.query({
      query: () => ({
        url: 'popular-tags',
        method: 'GET',
        credentials: 'include' as const,
      }),
      providesTags: (result) => [
        ...getTagsFromResult(result),
        { type: 'Tags', id: 'POPULAR' },
      ],
    }),
  }),
});

export const {
  useGetTopInteractedTagsQuery,
  useGetAllTagsQuery,
  useGetQuestionByTagsQuery,
  useGetPopularTagsQuery,
} = tagsApi;