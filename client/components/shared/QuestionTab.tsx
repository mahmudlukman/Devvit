'use client';

import { useGetUserQuestionsQuery } from '@/redux/features/user/userApi';
import { SearchParamsProps } from '@/types';
import React, { useEffect, useState } from 'react';
import QuestionCard from '../cards/QuestionCard';
import Pagination from './Pagination';
import NoResult from './NoResult';

interface Props extends SearchParamsProps {
  userId: string;
}

const QuestionTab = ({ searchParams, userId }: Props) => {
  const [questions, setQuestions] = useState([]);
  const { data, isLoading, isError } = useGetUserQuestionsQuery({
    userId,
    page: searchParams.page ? +searchParams.page : 1,
  });

  useEffect(() => {
    if (data && data.questions) {
      setQuestions(data.questions);
    }
  }, [data]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading tags</div>;

  return (
    <>
      <div className="mt-10 flex w-full flex-col gap-6">
        {questions.length > 0 ? (
          questions.map((question: any) => (
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
          ))
        ) : (
          <NoResult
            title="There's no Questions to show"
            description="Be the first to break the silence! 🚀 Ask a Question and kickstart the discussion. our query could be the next big thing others learn from. Get involved! 💡"
            link="/ask-question"
            linkTitle="Ask a Question"
          />
        )}
      </div>

      <div className="mt-10">
        <Pagination
          pageNumber={searchParams?.page ? +searchParams.page : 1}
          isNext={data.isNextQuestions}
        />
      </div>
    </>
  );
};

export default QuestionTab;
