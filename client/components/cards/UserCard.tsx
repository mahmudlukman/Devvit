'use client';

import { useGetTopInteractedTagsQuery } from '@/redux/features/tags/tagsApi';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import RenderTag from '../shared/RenderTag';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useGetUserInfoQuery } from '@/redux/features/user/userApi';

interface Props {
  user: {
    _id: string;
    avatar:
      | {
          url?: string;
        }
      | string;
    name: string;
    username: string;
  };
}

const UserCard = ({ user }: Props) => {
  const { data: userInfo, isLoading: isUserLoading } = useGetUserInfoQuery({ userId: user._id });
  const { data, isLoading, isError } = useGetTopInteractedTagsQuery({ userId: user._id });

  const interactedTags = data?.topInteractedTags || [];

  const getAvatarSrc = () => {
    if (userInfo?.user.avatar?.url) {
      return userInfo.user.avatar.url;
    }
    if (userInfo?.user.image) {
      return userInfo.user.image;
    }
    return "";
  };

  const getUserInitials = () => {
    if (userInfo?.user.name) {
      return userInfo.user.name.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <Link
      href={`/profile/${user._id}`}
      className="shadow-light100_darknone w-full max-xs:min-w-full xs:w-[260px]"
    >
      <article className="background-light900_dark200 light-border flex w-full flex-col items-center justify-center rounded-2xl border p-8">
        <Avatar className="h-[100px] w-[100px]">
          <AvatarImage src={getAvatarSrc()} alt="user profile picture" />
          <AvatarFallback className="bg-slate-300 text-slate-600 text-2xl">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>

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