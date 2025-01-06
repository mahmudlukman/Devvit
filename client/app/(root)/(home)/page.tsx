import Heading from "@/lib/Heading";
import { Suspense } from "react";
import HomeContent from "@/components/home/HomeContent";
import Loading from "./loading";

interface HomePageProps {
  searchParams: {
    q?: string;
    filter?: string;
    page?: string;
  };
}

export default function HomePage({ searchParams }: HomePageProps) {
  return (
    <>
      <Heading
        title="Dev Overflow"
        description="A community-driven platform for asking and answering programming questions. Get help, share knowledge, and collaborate with developers from around the world. Explore topics in web development, mobile app development, algorithms, data structures, and more."
        keywords="Programming, Coding, Education"
      />
      <Suspense fallback={<Loading />}>
        <HomeContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}