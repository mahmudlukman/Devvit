'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Theme from './Theme';
import MobileNav from './MobileNav';
import { UserButton } from '@/components/auth/UserButton';
import { useSelector } from 'react-redux';
import GlobalSearch from '../search/GlobalSearch';

const Navbar = () => {
  const { user } = useSelector((state: any) => state.auth);
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

        {user && <UserButton />}

        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;
