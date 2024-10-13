import Link from "next/link";
import Metric from "../shared/Metric";
import { formatAndDivideNumber, getTimestamp } from "@/lib/utils";
import EditDeleteAction from "../shared/EditDeleteAction";
import { useSelector } from "react-redux";
import { useEffect } from "react";

interface Props {
  _id: string;
  question: {
    _id: string;
    title: string;
  };
  author: {
    avatar: {
      url?: string; 
    } | string;
    _id: string;
    name: string;
  };
  upvotes: number;
  createdAt: Date;
}

const AnswerCard = ({
  _id,
  question,
  author,
  upvotes,
  createdAt,
}: Props) => {
  const { user } = useSelector((state: any) => state.auth);
  const showActionButtons = user && user._id === author._id;

  useEffect(() => {
    console.log("Current user in AnswerCard:", user);
    console.log("Author of answer:", author);
    console.log("Should show action buttons:", user && user._id === author._id);
  }, [user, author]);

  const getAvatarUrl = (avatar: { url?: string } | string): string => {
    if (typeof avatar === 'string') {
      return avatar || '../../public/assets/icons/avatar.svg';
    }
    return avatar?.url || '/assets/icons/avatar.svg';
  };

  return (
    <Link
      href={`/question/${question._id}/#${_id}`}
      className="card-wrapper rounded-[10px] px-11 py-9"
    >
      <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
        <div>
          <span className="subtle-regular text-dark400_light700 line-clamp-1 flex sm:hidden">
            {getTimestamp(createdAt)}
          </span>
          <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1">
            {question.title}
          </h3>
        </div>
        {showActionButtons && (
            <EditDeleteAction type="Answer" itemId={JSON.stringify(_id)} />
          )}
      </div>

      <div className="flex-between mt-6 w-full flex-wrap gap-3">
        <Metric
          imgUrl={getAvatarUrl(author.avatar)}
          alt="user avatar"
          value={author.name}
          title={` • asked ${getTimestamp(createdAt)}`}
          href={`/profile/${author._id}`}
          textStyles="body-medium text-dark400_light700"
          isAuthor
        />

        <div className="flex-center gap-3">
          <Metric
            imgUrl="/assets/icons/like.svg"
            alt="like icon"
            value={formatAndDivideNumber(upvotes)}
            title=" Votes"
            textStyles="small-medium text-dark400_light800"
          />
        </div>
      </div>
    </Link>
  );
};

export default AnswerCard;
