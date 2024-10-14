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
import { useLogOutQuery, useSocialAuthMutation } from '@/redux/features/auth/authApi';
import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';

interface User {
  avatar?: { url: string };
  image?: string;
  name?: string;
}

interface RootState {
  auth: {
    user: User | null;
  };
}

export const UserButton = ({ avatar, image, name }: User) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const {data} = useSession();
  const [socialAuth,{isSuccess,error}] = useSocialAuthMutation()
  const [logout, setLogout] = useState(false);
  const {} = useLogOutQuery(undefined, {
    skip: !logout ? true : false,
  });

  useEffect(()=>{
    if(!user){
        if(data){
            socialAuth({email:data?.user?.email,name:data?.user?.name,avatar:data.user?.image})
        }
    }
    if(data===null){
        if(isSuccess){
            toast.success("Login Successfully")
        }

    }
    // if(data===null){
    //     setLogout(true)
    // }
},[data, isSuccess, socialAuth, user])

  const logOutHandler = async () => {
    setLogout(true);
    await signOut();
    redirect('/');
  };

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
      <DropdownMenuContent className="w-40" align="end">
        {user && (
          <LogoutButton>
            <DropdownMenuItem onClick={logOutHandler}>
              <ExitIcon className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </LogoutButton>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
