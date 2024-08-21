'use client';

import Answer from '@/components/forms/Answer';
import AllAnswers from '@/components/shared/AllAnswers';
import Metric from '@/components/shared/Metric';
import ParseHTML from '@/components/shared/ParseHTML';
import RenderTag from '@/components/shared/RenderTag';
import Votes from '@/components/shared/Votes';
import { useGetQuestionQuery } from '@/redux/features/question/questionApi';
import { formatAndDivideNumber, getTimestamp } from '@/lib/utils';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FaUser } from 'react-icons/fa';

const Page = ({ params }: any) => {
  const { user } = useSelector((state: any) => state.auth);
  const {
    data: result,
    isLoading,
    isError,
  } = useGetQuestionQuery({ questionId: params.id });

  if (isLoading) return <div>Loading...</div>;
  if (isError || !result) return <div>Error loading question</div>;

  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
          <Link
            href={`/profile/${result.question.author._id}`}
            className="flex items-center justify-start gap-1"
          >
            {result.question.author.avatar ? (
              <Image
                src={result.question.author.avatar.url}
                width={18}
                height={18}
                alt="profile"
                className="rounded-full object-cover max-sm:mt-0.5 bg-slate-300 border-slate-400"
              />
            ) : (
              <FaUser className="rounded-full object-cover max-sm:mt-0.5 bg-slate-300 border-slate-400" />
            )}
            <p className="paragraph-semibold text-dark300_light700">
              {result.question.author.name}
            </p>
          </Link>
          <div className="flex justify-end">
            <Votes
              type="Question"
              itemId={result.question._id}
              userId={user._id}
              upvotes={result.question.upvotes.length}
              hasupVoted={result.question.upvotes.includes(user._id)}
              downvotes={result.question.downvotes.length}
              hasdownVoted={result.question.downvotes.includes(user._id)}
              hasSaved={user?.saved?.includes(result.question._id)}
            />
          </div>
        </div>
        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full text-left">
          {result.question.title}
        </h2>
      </div>

      <div className="mb-8 mt-5 flex flex-wrap gap-4">
        <Metric
          imgUrl="/assets/icons/clock.svg"
          alt="clock icon"
          value={` asked ${getTimestamp(result.question.createdAt)}`}
          title=" Asked"
          textStyles="small-medium text-dark400_light800"
        />
        <Metric
          imgUrl="/assets/icons/message.svg"
          alt="message"
          value={formatAndDivideNumber(result.question.answers.length)}
          title=" Answers"
          textStyles="small-medium text-dark400_light800"
        />
        <Metric
          imgUrl="/assets/icons/eye.svg"
          alt="eye"
          value={formatAndDivideNumber(result.question.views)}
          title=" Views"
          textStyles="small-medium text-dark400_light800"
        />
      </div>

      <ParseHTML data={result.question.content} />

      <div className="mt-8 flex flex-wrap gap-2">
        {result.question.tags.map((tag: any) => (
          <RenderTag
            key={tag._id}
            _id={tag._id}
            name={tag.name}
            showCount={false}
          />
        ))}
      </div>

      <AllAnswers
        questionId={result.question._id}
        userId={user._id}
        totalAnswers={result.question.answers.length}
      />

      <Answer
        question={result.question.content}
        questionId={result.question._id}
        authorId={user._id}
      />
    </>
  );
};

export default Page;
