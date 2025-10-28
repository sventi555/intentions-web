import { PropsWithChildren } from 'react';

export const StickyHeader: React.FC<PropsWithChildren> = (props) => {
  return (
    <div className="sticky top-0 z-10 border-b bg-white p-2">
      {props.children}
    </div>
  );
};
