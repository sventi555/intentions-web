import clsx from 'clsx';
import { PropsWithChildren } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  sticky?: boolean;
}

export const PageHeader: React.FC<PropsWithChildren<PageHeaderProps>> = (
  props,
) => {
  return (
    <div
      className={clsx(
        'top-[56px] z-10 border-b border-neutral-300 bg-white p-2 text-center',
        // sticky by default
        (props.sticky === undefined || props.sticky) && 'sticky',
      )}
    >
      <div className="text-lg">{props.title}</div>
      {props.subtitle ? <div className="text-sm">{props.subtitle}</div> : null}
    </div>
  );
};
