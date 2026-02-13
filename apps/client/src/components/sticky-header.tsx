import { CSSProperties, PropsWithChildren } from 'react';
import { pageHeaderHeight } from './page-wrapper';

export const stickyHeaderHeight = '41px';

export const StickyHeader: React.FC<PropsWithChildren> = (props) => {
  return (
    <div
      style={
        {
          '--sticky-header-height': stickyHeaderHeight,
          '--page-header-height': pageHeaderHeight,
        } as CSSProperties
      }
      className="sticky top-[var(--page-header-height)] z-10 box-border h-[var(--sticky-header-height)] border-b border-neutral-300 bg-white p-2"
    >
      {props.children}
    </div>
  );
};
