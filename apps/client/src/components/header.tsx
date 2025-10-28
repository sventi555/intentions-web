import { PropsWithChildren } from 'react';

export const Header: React.FC<PropsWithChildren> = (props) => {
  return <div className="border-b p-2">{props.children}</div>;
};
