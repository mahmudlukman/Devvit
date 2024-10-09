'use client';

import Question from '@/components/forms/Question';
import { useGetQuestionQuery, useEditQuestionMutation } from '@/redux/features/question/questionApi';
import { ParamsProps } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

const Page = ({ params }: ParamsProps) => {
  const router = useRouter();
  const { user } = useSelector((state: any) => state.auth);
  const { data: result, isLoading, isError } = useGetQuestionQuery({questionId: params.id});
  const [editQuestion, { isLoading: isUpdating }] = useEditQuestionMutation();

  useEffect(() => {
    if (!user && !isLoading) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // const handleUpdateQuestion = async (updatedData: any) => {
  //   try {
  //     await editQuestion({
  //       questionId: params.id,
  //       ...updatedData
  //     }).unwrap();
  //     router.push(`/question/${params.id}`);
  //   } catch (error) {
  //     console.error('Failed to update question:', error);
  //     // Handle error (e.g., show error message to user)
  //   }
  // };

  if (isError) {
    return <div>Error loading question. Please try again.</div>;
  }

  if (!result || !result.question) {
    return <div>No question data found.</div>;
  }

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Question</h1>

      <div className="mt-9">
        <Question
          type="Edit"
          userId={user?._id}
          questionDetails={JSON.stringify(result.question)}
          // onSubmit={handleUpdateQuestion}
        />
      </div>
    </>
  );
};

export default Page;