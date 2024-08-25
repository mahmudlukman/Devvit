"use client"

import { useGetUserQuestionsQuery } from '@/redux/features/user/userApi';
import { SearchParamsProps } from '@/types';
import React from 'react';
import QuestionCard from '../cards/QuestionCard';
import Pagination from './Pagination';

interface Props extends SearchParamsProps {
  userId: string;
}

const QuestionTab = ({ searchParams, userId }: Props) => {
  const { data: result, isLoading, isError } = useGetUserQuestionsQuery({
    userId,
    page: searchParams.page ? +searchParams.page : 1,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading questions</div>;
  }

  if (!result || !result.questions) {
    return <div>No questions found</div>;
  }

  return (
    <>
      {result.questions.map((question: any) => (
        <QuestionCard
          key={question._id}
          _id={question._id}
          title={question.title}
          tags={question.tags}
          author={question.author}
          upvotes={question.upvotes}
          views={question.views}
          answers={question.answers}
          createdAt={question.createdAt}
        />
      ))}

      <div className="mt-10">
        <Pagination
          pageNumber={searchParams?.page ? +searchParams.page : 1}
          isNext={result.isNextQuestions}
        />
      </div>
    </>
  );
};

export default QuestionTab;
