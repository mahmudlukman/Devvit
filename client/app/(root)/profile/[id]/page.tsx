'use client';

import { Button } from '@/components/ui/button';
import { useGetUserInfoQuery } from '@/redux/features/user/userApi';
import { URLProps } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import React from 'react';
import { getJoinedDate } from '@/lib/utils';
import ProfileLink from '@/components/shared/ProfileLink';
import Stats from '@/components/shared/Stats';
import QuestionTab from '@/components/shared/QuestionTab';
import AnswersTab from '@/components/shared/AnswersTab';
import { useSelector } from 'react-redux';
import { FaUser } from 'react-icons/fa';

const Page = ({ params, searchParams }: URLProps) => {
  const { user } = useSelector((state: any) => state.auth);
  // const { data: userInfo, isLoading } = useGetUserInfoQuery({ userId: params.id });

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <>
      <div className="flex flex-col-reverse items-start justify-between sm:flex-row">
        <div className="flex flex-col items-start gap-4 lg:flex-row">
          {user.avatar?.url ? (
            <Image
              src={user.avatar.url}
              width={18}
              height={18}
              alt="profile"
              className="rounded-full object-cover max-sm:mt-0.5"
            />
          ) : (
            <FaUser className="text-white" />
          )}

          <div className="mt-3">
            <h2 className="h2-bold text-dark100_light900">{user.name}</h2>
            <p className="paragraph-regular text-dark200_light800">
              @{user.username}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-start gap-5">
              {user.portfolioWebsite && (
                <ProfileLink
                  imgUrl="/assets/icons/link.svg"
                  href={user.portfolioWebsite}
                  title="Portfolio"
                />
              )}

              {user.location && (
                <ProfileLink
                  imgUrl="/assets/icons/location.svg"
                  title={user.location}
                />
              )}

              <ProfileLink
                imgUrl="/assets/icons/calendar.svg"
                title={getJoinedDate(user.joinedAt)}
              />
            </div>

            {user.bio && (
              <p className="paragraph-regular text-dark400_light800 mt-8">
                {user.bio}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end max-sm:mb-5 max-sm:w-full sm:mt-3">
          {user === user._id && (
            <Link href="/profile/edit">
              <Button className="paragraph-medium btn-secondary text-dark300_light900 min-h-[46px] min-w-[175px] px-4 py-3">
                Edit Profile
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Stats
        reputation={user.reputation}
        totalQuestions={user.totalQuestions}
        totalAnswers={user.totalAnswers}
        badges={user.badgeCounts}
      />

      <div className="mt-10 flex gap-10">
        <Tabs defaultValue="top-posts" className="flex-1">
          <TabsList className="background-light800_dark400 min-h-[42px] p-1">
            <TabsTrigger value="top-posts" className="tab">
              Top Posts
            </TabsTrigger>
            <TabsTrigger value="answers" className="tab">
              Answers
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="top-posts"
            className="mt-5 flex w-full flex-col gap-6"
          >
            <QuestionTab searchParams={searchParams} userId={user._id} />
          </TabsContent>
          <TabsContent value="answers" className="flex w-full flex-col gap-6">
            <AnswersTab searchParams={searchParams} userId={user._id} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Page;
