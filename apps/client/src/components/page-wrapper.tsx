import { clsx } from 'clsx';
import { CSSProperties, PropsWithChildren } from 'react';
import { Link } from 'wouter';

import LogoUrl from '@/assets/images/why.svg';
import { NavButtons } from '@/components/nav-buttons';
import { NavSidebar } from '@/components/nav-sidebar';

export const pageHeaderHeight = '56px';

interface PageWrapperProps {
  showNav?: boolean;
}

export const PageWrapper: React.FC<PropsWithChildren<PageWrapperProps>> = ({
  showNav = true,
  children,
}) => {
  const onClickHeader = () => {
    if (window.scrollY > 0) {
      window.scroll({ top: 0 });
    }
  };

  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{ '--page-header-height': pageHeaderHeight } as CSSProperties}
    >
      <div
        className="fixed top-0 right-0 left-0 z-20 flex h-[var(--page-header-height)] items-center justify-center bg-[#2C3B4E]"
        onClick={onClickHeader}
      >
        <Link
          href="~/"
          className="flex font-[courier] text-2xl tracking-widest text-[#f6f2e3]"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          wh
          <img className="size-[32px]" src={LogoUrl} />
        </Link>
      </div>

      <div className="mt-[var(--page-header-height)] flex grow justify-center">
        {showNav && (
          <div className="hidden sm:fixed sm:top-[var(--page-header-height)] sm:bottom-0 sm:left-0 sm:flex sm:flex-col">
            <NavSidebar />
          </div>
        )}

        <div
          className={clsx(
            'flex w-full max-w-[540px] flex-col sm:max-w-[540px]',
            showNav && 'sm:ml-[var(--page-header-height)]',
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
