'use client';

import { useGetAnswersQuery } from '@/redux/features/answer/answerApi';
import { useGetUserAnswersQuery } from '@/redux/features/user/userApi';
import { SearchParamsProps } from '@/types';
import AnswerCard from '../cards/AnswerCard';
import Pagination from './Pagination';
import { useEffect, useState } from 'react';
import QuestionCard from '../cards/QuestionCard';
import NoResult from './NoResult';

interface Props extends SearchParamsProps {
  userId: string;
}

const AnswersTab = ({ searchParams, userId }: Props) => {
  const [answers, setAnswers] = useState([]);
  const { data, isLoading, isError } = useGetUserAnswersQuery({
    userId,
    page: searchParams.page ? +searchParams.page : 1,
  });

  useEffect(() => {
    if (data && data.answers) {
      setAnswers(data.answers);
    }
  }, [data]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading tags</div>;

  return (
    <>
      <div className="mt-10 flex w-full flex-col gap-6">
        {answers.length > 0 ? (
          answers.map((answer: any) => (
            <AnswerCard
              key={answer._id}
              _id={answer._id}
              question={answer.question}
              author={answer.author}
              upvotes={answer.upvotes.length}
              createdAt={answer.createdAt}
            />
          ))
        ) : (
          <NoResult
            title="There's no Answers to show"
            description="Be the first to break the silence! 🚀 Answer a Question and kickstart the discussion. our query could be the next big thing others learn from. Get involved! 💡"
            link="/ask-question"
            linkTitle="Answer a Question"
          />
        )}
      </div>

      <div className="mt-10">
        <Pagination
          pageNumber={searchParams?.page ? +searchParams.page : 1}
          isNext={data.isNextAnswer}
        />
      </div>
    </>
  );
};

export default AnswersTab;
