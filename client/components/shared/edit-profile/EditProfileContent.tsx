'use client';

import Profile from '@/components/forms/Profile';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

const EditProfileContent = () => {
  const router = useRouter();
  const { user } = useSelector((state: any) => state.auth);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Profile</h1>
      
      <div className="mt-9">
        <Profile user={user} />
      </div>
    </>
  );
};

export default EditProfileContent;