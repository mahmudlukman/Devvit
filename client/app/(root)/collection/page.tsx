import { Suspense } from 'react';
import SavedQuestionsContent from '@/components/shared/collection/CollectionContent';
import { SearchParamsProps } from '@/types';

export default function SavedQuestionsPage({ searchParams }: SearchParamsProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SavedQuestionsContent searchParams={searchParams} />
    </Suspense>
  );
}