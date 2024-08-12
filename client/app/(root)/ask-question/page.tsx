"use client"

import Question from '@/components/forms/Question'
import { redirect } from 'next/navigation';
import React from 'react'
import { useSelector } from 'react-redux';

const Page = async () => {
  const { user } = useSelector((state: any) => state.auth);

  if (!user) redirect('/login');

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">Ask a question</h1>

      <div className="mt-9">
        <Question userId={JSON.stringify(user._id)}/>
      </div>
    </div>
  )
}

export default Page