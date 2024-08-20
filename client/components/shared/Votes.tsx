"use client"

import { 
  useUpvoteQuestionMutation, 
  useDownvoteQuestionMutation 
} from '@/redux/features/question/questionApi';
import { formatAndDivideNumber } from "@/lib/utils";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from 'react-redux';

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
  upvotes,
  hasupVoted,
  downvotes,
  hasdownVoted,
  hasSaved,
}: Props) => {
  const pathname = usePathname();
  const router = useRouter();

  const [upvoteQuestion] = useUpvoteQuestionMutation();
  const [downvoteQuestion] = useDownvoteQuestionMutation();
  const { user } = useSelector((state: any) => state.auth);

  const handleVote = async (action: string) => {
    if (!user) {
      return;
    }

    const voteData = {
      questionId: itemId,
      userId: user._id,
      hasupVoted,
      hasdownVoted,
      path: pathname,
    };

    if (action === 'upvote') {
      if (type === 'Question') {
        await upvoteQuestion(voteData);
      }
      // Todo: handle Answer votes if needed
      return;
    }

    if (action === 'downvote') {
      if (type === 'Question') {
        await downvoteQuestion(voteData);
      }
      // Todo: handle Answer votes if needed
    }
  }

  // Optionally, you can handle side-effects like saving the question or viewing it, but this is just an example for votes
  useEffect(() => {
    // Assuming you want to track views using a different action
    // viewQuestion({
    //   questionId: JSON.parse(itemId),
    //   userId: userId ? JSON.parse(userId) : undefined,
    // });
  }, [itemId, userId, pathname, router]);

  return (
    <div className="flex gap-5">
      <div className="flex-center gap-2.5">
        <div className="flex-center gap-1.5">
          <Image 
            src={hasupVoted
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
            src={hasdownVoted
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
          src={hasSaved
            ? '/assets/icons/star-filled.svg'
            : '/assets/icons/star-red.svg'
          }
          width={18}
          height={18}
          alt="star"
          className="cursor-pointer"
          onClick={() => {
            // Implement saving functionality using a Redux mutation if necessary
          }}
        />
      )}
    </div>
  )
}

export default Votes;
