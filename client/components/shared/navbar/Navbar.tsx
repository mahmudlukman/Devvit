"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FaUser } from "react-icons/fa";
import Theme from "./Theme";
import MobileNav from "./MobileNav";
import GlobalSearch from "../search/GlobalSearch";
import {
  useLogOutQuery,
  useSocialAuthMutation,
} from "@/redux/features/auth/authApi";

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

const Navbar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: session, status } = useSession();
  const [socialAuth, { isSuccess, error }] = useSocialAuthMutation();
  const [logout, setLogout] = useState(false);
  const router = useRouter();

  const {} = useLogOutQuery(undefined, {
    skip: !logout,
  });

  useEffect(() => {
    if (status === "authenticated" && session && !user) {
      socialAuth({
        email: session.user?.email,
        name: session.user?.name,
        avatar: session.user?.image,
      });
    }
  }, [status, session, user, socialAuth]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Login Successful");
    }
  }, [isSuccess]);

  const getAvatarSrc = () => {
    if (user?.avatar?.url) {
      return user.avatar.url;
    }
    if (user?.image) {
      return user.image;
    }
    if (session?.user?.image) {
      return session.user.image;
    }
    return "";
  };

  const getUserInitials = () => {
    const name = user?.name || session?.user?.name;
    if (name) {
      return name.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <nav className="flex-between background-light900_dark200 fixed z-50 w-full gap-5 p-6 shadow-light-300 dark:shadow-none sm:px-12">
      <Link href="/" className="flex items-center gap-1">
        <Image
          src="/assets/images/site-logo.svg"
          width={23}
          height={23}
          alt="DevFlow"
        />
        <p className="h2-bold font-spaceGrotesk text-dark-100 dark:text-light-900 max-sm:hidden">
          Dev <span className="text-primary-500">Overflow</span>
        </p>
      </Link>

      <GlobalSearch />

      <div className="flex-between gap-5">
        <Theme />

        {(user || session) && (
          <Avatar>
            <AvatarImage src={getAvatarSrc()} />
            <AvatarFallback className="bg-gray-200">
              {user || session ? (
                getUserInitials()
              ) : (
                <FaUser className="text-white" />
              )}
            </AvatarFallback>
          </Avatar>
        )}

        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;
