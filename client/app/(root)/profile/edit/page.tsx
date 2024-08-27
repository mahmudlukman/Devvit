"use client"

import Profile from '@/components/forms/Profile';
import { ParamsProps } from '@/types';
import { redirect } from 'next/navigation';
import { useSelector } from 'react-redux';

const Page = ({ params }: ParamsProps) => {
  const { user } = useSelector((state: any) => state.auth);

  if(!user) redirect('/login');

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Profile</h1>
      
      <div className="mt-9">
        <Profile 
          user={user}
        />
      </div>
    </>
  )
}

export default Page