import { PropsWithChildren } from 'react';

export const StickyHeader: React.FC<PropsWithChildren> = (props) => {
  return (
    <div className="sticky top-[56px] z-10 border-b border-neutral-300 bg-white p-2">
      {props.children}
    </div>
  );
};
