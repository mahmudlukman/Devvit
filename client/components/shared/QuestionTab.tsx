import { useGetUserQuestionsQuery } from '@/redux/features/user/userApi';
import { SearchParamsProps } from '@/types';
import React from 'react';
import QuestionCard from '../cards/QuestionCard';
import Pagination from './Pagination';
import page from '@/app/(auth)/error/page';

interface Props extends SearchParamsProps {
  userId: string;
}

const QuestionTab = async ({ searchParams, userId }: Props) => {
  const { data: result } = useGetUserQuestionsQuery({
    userId,
    page: searchParams.page ? +searchParams.page : 1,
  });

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
