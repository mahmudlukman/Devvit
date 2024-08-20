import { useGetAnswersQuery } from '@/redux/features/answer/answerApi';
import { SearchParamsProps } from '@/types';
import AnswerCard from '../cards/AnswerCard';
import Pagination from './Pagination';

interface Props extends SearchParamsProps {
  userId: string;
}

const AnswersTab = async ({ searchParams, userId }: Props) => {
  const {
    data: result,
    isLoading,
    isError,
  } = useGetAnswersQuery({
    userId,
    page: searchParams.page ? +searchParams.page : 1,
  });

  return (
    <>
      {result.answers.map((item: any) => (
        <AnswerCard
          key={item._id}
          _id={item._id}
          question={item.question}
          author={item.author}
          upvotes={item.upvotes.length}
          createdAt={item.createdAt}
        />
      ))}

      <div className="mt-10">
        <Pagination
          pageNumber={searchParams?.page ? +searchParams.page : 1}
          isNext={result.isNextAnswer}
        />
      </div>
    </>
  );
};

export default AnswersTab;
