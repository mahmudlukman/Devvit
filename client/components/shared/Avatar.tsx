import React from 'react';
import { Avatar as UIAvatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface AvatarProps {
  user: {
    name: string;
    avatar:
      | {
          url?: string;
        }
      | string;
  };
  size?: number;
}

const Avatar: React.FC<AvatarProps> = ({ user, size = 100 }) => {
  const getAvatarSrc = (): string => {
    if (typeof user.avatar === 'string') {
      return user.avatar || '/assets/icons/avatar.svg';
    }
    return user.avatar?.url || '/assets/icons/avatar.svg';
  };

  const getUserInitials = (): string => {
    return user.name.charAt(0).toUpperCase();
  };

  return (
    <UIAvatar className={`h-[${size}px] w-[${size}px]`}>
      <AvatarImage src={getAvatarSrc()} alt="user profile picture" />
      <AvatarFallback className="bg-slate-300 text-slate-600 text-2xl">
        {getUserInitials()}
      </AvatarFallback>
    </UIAvatar>
  );
};

export default Avatar;