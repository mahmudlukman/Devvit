"use client";

import Heading from "@/lib/Heading";
import QuestionCard from "@/components/cards/QuestionCard";
import HomeFilters from "@/components/home/HomeFilters";
import Filter from "@/components/shared/Filter";
import NoResult from "@/components/shared/NoResult";
import Pagination from "@/components/shared/Pagination";
import LocalSearchbar from "@/components/shared/search/LocalSearchbar";
import { Button } from "@/components/ui/button";
import { HomePageFilters } from "@/constants/filters";
import {
  useGetQuestionsQuery,
  useGetRecommendedQuestionsQuery,
} from "@/redux/features/question/questionApi";
import { SearchParamsProps } from "@/types";
import Link from "next/link";
import { useSelector } from "react-redux";
import Loading from "./loading";

export default function Home({ searchParams }: SearchParamsProps) {
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
      <Heading
        title="Dev Overflow"
        description="A community-driven platform for asking and answering programming questions. Get help, share knowledge, and collaborate with developers from around the world. Explore topics in web development, mobile app development, algorithms, data structures, and more."
        keywords="Programming, Coding, Education"
      />
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
