import { Suspense } from 'react';
import AskQuestionContent from '@/components/shared/ask-question/AskQuestionContent';

export default function AskQuestionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AskQuestionContent />
    </Suspense>
  );
}