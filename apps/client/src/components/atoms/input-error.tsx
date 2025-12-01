import { PropsWithChildren } from 'react';

export const InputError: React.FC<PropsWithChildren> = (props) => {
  return <div className="text-sm text-red-400">{props.children}</div>;
};
