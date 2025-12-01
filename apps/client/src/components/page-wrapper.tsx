import { PropsWithChildren } from 'react';
import { Link } from 'wouter';
import LogoUrl from '../assets/images/why.svg';
import { NavButtons } from './nav-buttons';
import { NavSidebar } from './nav-sidebar';

interface PageWrapperProps {
  showNav?: boolean;
}

export const PageWrapper: React.FC<PropsWithChildren<PageWrapperProps>> = ({
  showNav = true,
  children,
}) => {
  return (
    <div className="flex min-h-dvh flex-col">
      <Link
        href="/"
        className="fixed top-0 right-0 left-0 z-10 flex h-[56px] items-center justify-center bg-[#2C3B4E] font-[courier] text-2xl tracking-widest text-[#f6f2e3]"
      >
        wh
        <img className="size-[32px]" src={LogoUrl} />
      </Link>

      <div className="flex grow pt-[56px]">
        {showNav && (
          <div className="hidden sm:flex sm:flex-col">
            <NavSidebar />
          </div>
        )}

        <div className="mx-auto flex max-w-[540px] grow flex-col sm:max-w-[540px]">
          {children}
        </div>
      </div>

      {showNav && (
        <div className="flex flex-col sm:hidden">
          <NavButtons />
        </div>
      )}
    </div>
  );
};
