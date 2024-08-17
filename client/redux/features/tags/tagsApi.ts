import { apiSlice } from '../api/apiSlice';

export const tagsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTopInteractedTags: builder.query({
      query: (id) => ({
        url: `get-top-tags/${id}`,
        method: 'GET',
        credentials: 'include' as const,
      }),
    }),
    getAllTags: builder.query({
      query: () => ({
        url: 'get-tags',
        method: 'GET',
        credentials: 'include' as const,
      }),
    }),
    getQuestionByTags: builder.query({
      query: (tagId) => ({
        url: `question-by-tag/${tagId}`,
        method: 'GET',
        credentials: 'include' as const,
      }),
    }),
  }),
});

export const {
  useGetTopInteractedTagsQuery,
  useGetAllTagsQuery,
  useGetQuestionByTagsQuery,
} = tagsApi;
