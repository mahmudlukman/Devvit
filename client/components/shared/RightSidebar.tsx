'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import RenderTag from './RenderTag';
import { useGetHotQuestionsQuery } from '@/redux/features/question/questionApi';
import { useGetPopularTagsQuery } from '@/redux/features/tags/tagsApi';

const RightSidebar = () => {
  const [hotQuestions, setHotQuestions] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const { data: hotQuestionsData } = useGetHotQuestionsQuery({});
  const { data: popularTagsData} = useGetPopularTagsQuery({});
  
  useEffect(() => {
    if (hotQuestionsData && hotQuestionsData.hotQuestions) {
      setHotQuestions(hotQuestionsData.hotQuestions);
    }
    if (popularTagsData && popularTagsData.popularTags) {
      setPopularTags(popularTagsData.popularTags);
    }
  }, [hotQuestionsData, popularTagsData]);

  return (
    <section className="background-light900_dark200 light-border custom-scrollbar sticky right-0 top-0 flex h-screen w-[350px] flex-col overflow-y-auto border-l p-6 pt-36 shadow-light-300 dark:shadow-none max-xl:hidden">
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>
        <div className="mt-7 flex w-full flex-col gap-[30px]">
          {hotQuestions.length > 0 ? (
            hotQuestions.map((question: any) => (
              <Link
                href={`/question/${question._id}`}
                key={question._id}
                className='flex cursor-pointer items-center justify-between gap-7'
              >
                <p className="body-medium text-dark500_light700">{question.title}</p>
                <Image 
                  src="/assets/icons/chevron-right.svg"
                  alt="chevron right"
                  width={20}
                  height={20}
                  className="invert-colors"
                />
              </Link>
            ))
          ) : (
            <p>No hot questions available.</p>
          )}
        </div>
      </div>
      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <div className="mt-7 flex flex-col gap-4">
          {popularTags.length > 0 ? (
            popularTags.map((tag: any) => (
              <RenderTag 
                key={tag._id}
                _id={tag._id}
                name={tag.name}
                totalQuestions={tag.totalQuestions}
                showCount
              />
            ))
          ) : (
            <p>No popular tags available.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;
