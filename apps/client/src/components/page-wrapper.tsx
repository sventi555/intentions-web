import { clsx } from 'clsx';
import { PropsWithChildren } from 'react';
import { Link } from 'wouter';

import LogoUrl from '@/assets/images/why.svg';
import { NavButtons } from '@/components/nav-buttons';
import { NavSidebar } from '@/components/nav-sidebar';

interface PageWrapperProps {
  showNav?: boolean;
}

export const PageWrapper: React.FC<PropsWithChildren<PageWrapperProps>> = ({
  showNav = true,
  children,
}) => {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="fixed top-0 right-0 left-0 z-20 flex h-[56px] items-center justify-center bg-[#2C3B4E]">
        <Link
          href="/"
          className="flex font-[courier] text-2xl tracking-widest text-[#f6f2e3]"
        >
          wh
          <img className="size-[32px]" src={LogoUrl} />
        </Link>
      </div>

      <div className="mt-[56px] flex grow justify-center">
        {showNav && (
          <div className="hidden sm:fixed sm:top-[56px] sm:bottom-0 sm:left-0 sm:flex sm:flex-col">
            <NavSidebar />
          </div>
        )}

        <div
          className={clsx(
            'flex w-full max-w-[540px] flex-col sm:max-w-[540px]',
            showNav && 'sm:ml-[56px]',
          )}
        >
          {children}
        </div>
      </div>

      {showNav && (
        <div className="block sm:hidden">
          <NavButtons />
        </div>
      )}
    </div>
  );
};
