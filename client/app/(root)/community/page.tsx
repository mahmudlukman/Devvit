import { Suspense } from 'react';
import CommunityContent from '@/components/shared/community/CommunityContent';
import { SearchParamsProps } from '@/types';

export default function CommunityPage({ searchParams }: SearchParamsProps) {
  return (
    <Suspense 
      fallback={
        <div className="flex-center w-full">
          <div className="flex-center flex-col gap-4">
            <div className="h1-bold text-dark100_light900">Loading users...</div>
          </div>
        </div>
      }
    >
      <CommunityContent searchParams={searchParams} />
    </Suspense>
  );
}