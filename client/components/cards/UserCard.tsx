'use client';

import { useGetTopInteractedTagsQuery } from '@/redux/features/tags/tagsApi';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import RenderTag from '../shared/RenderTag';

interface Props {
  user: {
    _id: string;
    avatar: {
      url?: string; 
    } | string;
    name: string;
    username: string;
  };
}

const UserCard = ({ user }: Props) => {
  const { data, isLoading, isError } = useGetTopInteractedTagsQuery(user._id);

  const interactedTags = data?.interactedTags || [];

  const getAvatarUrl = (avatar: { url?: string } | string): string => {
    if (typeof avatar === 'string') {
      return avatar || '../../public/assets/icons/avatar.svg';
    }
    return avatar?.url || '/assets/icons/avatar.svg';
  };

  return (
    <Link
      href={`/profile/${user._id}`}
      className="shadow-light100_darknone w-full max-xs:min-w-full xs:w-[260px]"
    >
      <article className="background-light900_dark200 light-border flex w-full flex-col items-center justify-center rounded-2xl border p-8">
        <Image
          src={getAvatarUrl(user.avatar)}  // Updated to use user.avatar
          alt="user profile picture"
          width={100}
          height={100}
          className="rounded-full bg-slate-300 border-slate-400"
        />

        <div className="mt-4 text-center">
          <h3 className="h3-bold text-dark200_light900 line-clamp-1">
            {user.name}
          </h3>
          <p className="body-regular text-dark500_light500 mt-2">
            @{user.username}
          </p>
        </div>

        <div className="mt-5">
          {isLoading ? (
            <Badge>Loading tags...</Badge>
          ) : isError || interactedTags.length === 0 ? (
            <Badge>No tags yet</Badge>
          ) : (
            <div className="flex items-center gap-2">
              {interactedTags.map((tag: any) => (
                <RenderTag key={tag._id} _id={tag._id} name={tag.name} />
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};

export default UserCard;
