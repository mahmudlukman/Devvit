'use client';

import QuestionCard from '@/components/cards/QuestionCard';
import Filter from '@/components/shared/Filter';
import NoResult from '@/components/shared/NoResult';
import LocalSearchbar from '@/components/shared/search/LocalSearchbar';
import { QuestionFilters } from '@/constants/filters';
import { useGetSavedQuestionsQuery } from '@/redux/features/user/userApi';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
// import { getSavedQuestions } from "@/lib/actions/user.action";

export default function Home() {
  const { user } = useSelector((state: any) => state.auth);
  const [questions, setQuestions] = useState([]);

  if (!user) return null;

  const { data, isLoading, isError } = useGetSavedQuestionsQuery({
    userId: user._id,
  });

  useEffect(() => {
    if (data && data.savedQuestions) {
      setQuestions(data.savedQuestions);
    }
    console.log(data)
  }, [data]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading saved questions</div>;

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchbar
          route="/"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for questions"
          otherClasses="flex-1"
        />

        <Filter
          filters={QuestionFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </div>

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
            title="There’s no question saved to show"
            description="Be the first to break the silence! 🚀 Ask a Question and kickstart the discussion. our query could be the next big thing others learn from. Get involved! 💡"
            link="/ask-question"
            linkTitle="Ask a Question"
          />
        )}
      </div>
    </>
  );
}
