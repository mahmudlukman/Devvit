'use client';

import {
  useUpvoteAnswerMutation,
  useDownvoteAnswerMutation,
} from '@/redux/features/answer/answerApi';
import {
  useUpvoteQuestionMutation,
  useDownvoteQuestionMutation,
} from '@/redux/features/question/questionApi';
import { useToggleSavedQuestionMutation } from '@/redux/features/user/userApi';
import { useGetViewQuestionQuery } from '@/redux/features/interaction/interactionApi';
import { formatAndDivideNumber } from '@/lib/utils';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from '../ui/use-toast';

interface Props {
  type: string;
  itemId: string;
  userId: string;
  upvotes: number;
  hasupVoted: boolean;
  downvotes: number;
  hasdownVoted: boolean;
  hasSaved?: boolean;
}

const Votes = ({
  type,
  itemId,
  userId,
  upvotes: initialUpvotes,
  hasupVoted: initialHasUpvoted,
  downvotes: initialDownvotes,
  hasdownVoted: initialHasDownvoted,
  hasSaved: initialHasSaved,
}: Props) => {

  const [toggleSavedQuestion] = useToggleSavedQuestionMutation();
  const [upvoteQuestion] = useUpvoteQuestionMutation();
  const [downvoteQuestion] = useDownvoteQuestionMutation();
  const [upvoteAnswer] = useUpvoteAnswerMutation();
  const [downvoteAnswer] = useDownvoteAnswerMutation();

  // Local state to handle optimistic updates
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [hasDownvoted, setHasDownvoted] = useState(initialHasDownvoted);
  const [hasSaved, setHasSaved] = useState(initialHasSaved);

  const { data: viewData, isSuccess } = useGetViewQuestionQuery(
    { questionId: itemId },
    { skip: type !== 'Question' }
  );

  useEffect(() => {
    if (type === 'Question' && isSuccess) {
      console.log('Question view counted:', viewData);
    }
  }, [isSuccess, viewData, type]);

  const handleSave = async () => {
    try {
      setHasSaved(!hasSaved); // Optimistic update

      await toggleSavedQuestion(itemId).unwrap();
      toast({
        title: `Question ${
          !hasSaved ? 'Saved in' : 'Removed from'
        } your collection`,
        variant: !hasSaved ? 'default' : 'destructive',
      });
    } catch (error) {
      setHasSaved(hasSaved); // Revert if the request fails
      toast({
        title: 'Error',
        description: 'Failed to save question',
        variant: 'destructive',
      });
    }
  };

  const handleVote = async (action: string) => {
    if (!userId) {
      return toast({
        title: 'Please log in',
        description: 'You must be logged in to perform this action',
      });
    }

    try {
      if (action === 'upvote') {
        if (hasUpvoted) {
          // Remove upvote
          setHasUpvoted(false);
          setUpvotes(upvotes - 1);
        } else {
          // Add upvote
          setHasUpvoted(true);
          setUpvotes(upvotes + 1);
          // Remove downvote if exists
          if (hasDownvoted) {
            setHasDownvoted(false);
            setDownvotes(downvotes - 1);
          }
        }

        if (type === 'Question') {
          await upvoteQuestion({ questionId: itemId }).unwrap();
        } else if (type === 'Answer') {
          await upvoteAnswer({ answerId: itemId }).unwrap();
        }

        toast({
          title: `Upvote ${hasUpvoted ? 'Removed' : 'Added'}`,
          variant: 'default',
        });
      } else if (action === 'downvote') {
        if (hasDownvoted) {
          // Remove downvote
          setHasDownvoted(false);
          setDownvotes(downvotes - 1);
        } else {
          // Add downvote
          setHasDownvoted(true);
          setDownvotes(downvotes + 1);
          // Remove upvote if exists
          if (hasUpvoted) {
            setHasUpvoted(false);
            setUpvotes(upvotes - 1);
          }
        }

        if (type === 'Question') {
          await downvoteQuestion({ questionId: itemId }).unwrap();
        } else if (type === 'Answer') {
          await downvoteAnswer({ answerId: itemId }).unwrap();
        }

        toast({
          title: `Downvote ${hasDownvoted ? 'Removed' : 'Added'}`,
          variant: 'default',
        });
      }
    } catch (error) {
      // Revert the optimistic update if the request fails
      setHasUpvoted(initialHasUpvoted);
      setHasDownvoted(initialHasDownvoted);
      setUpvotes(initialUpvotes);
      setDownvotes(initialDownvotes);
      toast({
        title: 'Error',
        description: `Failed to ${action} the ${type.toLowerCase()}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex gap-5">
      <div className="flex-center gap-2.5">
        <div className="flex-center gap-1.5">
          <Image
            src={
              hasUpvoted
                ? '/assets/icons/upvoted.svg'
                : '/assets/icons/upvote.svg'
            }
            width={18}
            height={18}
            alt="upvote"
            className="cursor-pointer"
            onClick={() => handleVote('upvote')}
          />
          <div className="flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1">
            <p className="subtle-medium text-dark400_light900">
              {formatAndDivideNumber(upvotes)}
            </p>
          </div>
        </div>
        <div className="flex-center gap-1.5">
          <Image
            src={
              hasDownvoted
                ? '/assets/icons/downvoted.svg'
                : '/assets/icons/downvote.svg'
            }
            width={18}
            height={18}
            alt="downvote"
            className="cursor-pointer"
            onClick={() => handleVote('downvote')}
          />
          <div className="flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1">
            <p className="subtle-medium text-dark400_light900">
              {formatAndDivideNumber(downvotes)}
            </p>
          </div>
        </div>
      </div>
      {type === 'Question' && (
        <Image
          src={
            hasSaved
              ? '/assets/icons/star-filled.svg'
              : '/assets/icons/star-red.svg'
          }
          width={18}
          height={18}
          alt="star"
          className="cursor-pointer"
          onClick={handleSave}
        />
      )}
    </div>
  );
};

export default Votes;
