import Link from 'next/link';
import React from 'react'
import { useSelector } from 'react-redux';
import RenderTag from '../shared/RenderTag';
import Metric from '../shared/Metric';
import EditDeleteAction from '../shared/EditDeleteAction';
import { formatAndDivideNumber, getTimestamp } from '@/lib/utils';

interface QuestionProps {
  _id: string;
  title: string;
  tags: {
    _id: string;
    name: string;
  }[];
  author: {
    avatar: {
      url?: string; 
    } | string;
    _id: string;
    name: string;
  };
  upvotes: string[];
  views: number;
  answers: Array<object>;
  createdAt: Date;
}

const QuestionCard = ({
  _id,
  title,
  tags,
  author,
  upvotes,
  views,
  answers,
  createdAt
}: QuestionProps) => {
  const { user } = useSelector((state: any) => state.auth);
  const showActionButtons = user && user._id === author._id;

  const getAvatarUrl = (avatar: { url?: string } | string): string => {
    if (typeof avatar === 'string') {
      return avatar || '../../public/assets/icons/avatar.svg';
    }
    return avatar?.url || '/assets/icons/avatar.svg';
  };

  return (
    <div className="card-wrapper rounded-[10px] p-9 sm:px-11">
      <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
        <div>
          <span className="subtle-regular text-dark400_light700 line-clamp-1 flex sm:hidden">
            {getTimestamp(createdAt)}
          </span>
          <Link href={`/question/${_id}`}>
            <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1">
              {title} 
            </h3>
          </Link>
        </div>
        {showActionButtons && (
            <EditDeleteAction type="Question" itemId={JSON.stringify(_id)} />
          )}
      </div>
      
      <div className="mt-3.5 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <RenderTag key={tag._id} _id={tag._id} name={tag.name} />
        ))}
      </div>

      <div className="flex-between mt-6 w-full flex-wrap gap-3">
          <Metric 
            imgUrl={getAvatarUrl(author.avatar)}
            alt="user"
            value={author.name}
            title={` - asked ${getTimestamp(createdAt)}`}
            href={`/profile/${author._id}`}
            isAuthor
            textStyles="body-medium text-dark400_light700"
            imgStyles="bg-slate-300 border-1 border-slate-400"
          />

          <Metric 
            imgUrl="/assets/icons/like.svg"
            alt="Upvotes"
            value={formatAndDivideNumber(upvotes.length)}
            title=" Votes"
            textStyles="small-medium text-dark400_light800"
          />
          <Metric 
            imgUrl="/assets/icons/message.svg"
            alt="message"
            value={formatAndDivideNumber(answers.length)}
            title=" Answers"
            textStyles="small-medium text-dark400_light800"
          />
          <Metric 
            imgUrl="/assets/icons/eye.svg"
            alt="eye"
            value={formatAndDivideNumber(views)}
            title=" Views"
            textStyles="small-medium text-dark400_light800"
          />
      </div>
    </div>
  )
}

export default QuestionCard