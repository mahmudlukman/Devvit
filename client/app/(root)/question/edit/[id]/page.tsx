'use client';

import Question from '@/components/forms/Question';
import { useGetQuestionQuery } from '@/redux/features/question/questionApi';
import { ParamsProps } from '@/types';
import { redirect } from 'next/navigation';
import { useSelector } from 'react-redux';

const Page = ({ params }: ParamsProps) => {
  const { user } = useSelector((state: any) => state.auth);
  const { data: result, isLoading, isError } = useGetQuestionQuery({questionId: params.id});

  console.log(result)

  if (!user) redirect('/login');

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Question</h1>

      <div className="mt-9">
        <Question
          type="Edit"
          userId={user._id}
          questionDetails={JSON.stringify(result.question)}
        />
      </div>
    </>
  );
};

export default Page;
