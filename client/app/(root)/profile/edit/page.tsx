import { Suspense } from 'react';
import EditProfileContent from '@/components/shared/edit-profile/EditProfileContent';
import { ParamsProps } from '@/types';

export default function EditProfilePage({ params }: ParamsProps) {
  return (
    <Suspense 
      fallback={
        <div className="flex-center w-full">
          <div className="flex-center flex-col gap-4">
            <div className="h1-bold text-dark100_light900">Loading profile...</div>
          </div>
        </div>
      }
    >
      <EditProfileContent />
    </Suspense>
  );
}