"use client";

import { useSelector } from "react-redux";
import {
  useGetQuestionsQuery,
  useGetRecommendedQuestionsQuery,
} from "@/redux/features/question/questionApi";
import QuestionCard from "@/components/cards/QuestionCard";
import HomeFilters from "@/components/home/HomeFilters";
import Filter from "@/components/shared/Filter";
import NoResult from "@/components/shared/NoResult";
import Pagination from "@/components/shared/Pagination";
import LocalSearchbar from "@/components/shared/search/LocalSearchbar";
import { Button } from "@/components/ui/button";
import { HomePageFilters } from "@/constants/filters";
import Link from "next/link";
import Loading from "../../app/(root)/(home)/loading";

interface HomeContentProps {
  searchParams: {
    q?: string;
    filter?: string;
    page?: string;
  };
}

export default function HomeContent({ searchParams }: HomeContentProps) {
  const { user } = useSelector((state: any) => state.auth);

  const { data: recommendedData, isLoading: recommendedLoading } =
    useGetRecommendedQuestionsQuery(undefined, {
      skip: !user || searchParams?.filter !== "recommended",
    });

  const {
    data: questionsData,
    isLoading: questionsLoading,
    isError,
  } = useGetQuestionsQuery(
    {
      searchQuery: searchParams.q,
      filter: searchParams.filter,
      page: searchParams.page ? +searchParams.page : 1,
      pageSize: 10,
    },
    {
      skip: searchParams?.filter === "recommended",
    }
  );

  const isLoading = recommendedLoading || questionsLoading;

  let questions = [];
  let isNext = false;

  if (searchParams?.filter === "recommended" && user) {
    questions = recommendedData?.questions || [];
    isNext = recommendedData?.isNext || false;
  } else {
    questions = questionsData?.questions || [];
    isNext = questionsData?.isNext || false;
  }

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <div>Error loading questions</div>;
  }

  return (
    <>
      <div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>

        <Link href="/ask-question" className="flex justify-end max-sm:w-full">
          <Button className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900">
            Ask a Question
          </Button>
        </Link>
      </div>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchbar
          route="/"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for questions"
          otherClasses="flex-1"
        />

        <Filter
          filters={HomePageFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
          containerClasses="hidden max-md:flex"
        />
      </div>

      <HomeFilters />

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
            title="There's no question to show"
            description="Be the first to break the silence! 🚀 Ask a Question and kickstart the discussion. Your query could be the next big thing others learn from. Get involved! 💡"
            link="/ask-question"
            linkTitle="Ask a Question"
          />
        )}
      </div>

      {questions.length > 0 && (
        <div className="mt-10">
          <Pagination
            pageNumber={searchParams?.page ? +searchParams.page : 1}
            isNext={isNext}
          />
        </div>
      )}
    </>
  );
}
