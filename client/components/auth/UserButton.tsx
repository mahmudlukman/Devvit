'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { FaUser } from 'react-icons/fa';
import { ExitIcon } from '@radix-ui/react-icons';
import { LogoutButton } from './LogoutButton';
import { useSelector } from 'react-redux';

export const UserButton = () => {
  const { user } = useSelector((state: any) => state.auth);

  const getAvatarSrc = () => {
    if (user?.avatar?.url) {
      return user.avatar.url;
    }
    if (user?.image) {
      return user.image;
    }
    return '';
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={getAvatarSrc()} />
          <AvatarFallback className="bg-gray-200">
            {user ? getUserInitials() : <FaUser className="text-white" />}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-40' align='end'>
        {user ? (
          <LogoutButton>
            <DropdownMenuItem>
              <ExitIcon className='h-4 w-4 mr-2'/>
              Logout
            </DropdownMenuItem>
          </LogoutButton>
        ) : (
          <DropdownMenuItem>
            Login
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};