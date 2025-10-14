import { PropsWithChildren } from 'react';
import { Link } from 'wouter';

export const TabBar: React.FC = () => {
  const authUserId = 'temp';

  return (
    <nav className="fixed bottom-0 flex w-full bg-neutral-100">
      <TabButton href="/">Feed</TabButton>
      <TabButton href="/search">Search</TabButton>
      <TabButton href="/create">Create</TabButton>
      <TabButton href="/notifications">Notifs</TabButton>
      <TabButton href={`/profile/${authUserId}`}>Profile</TabButton>
    </nav>
  );
};

interface TabButtonProps {
  href: string;
}

const TabButton: React.FC<PropsWithChildren<TabButtonProps>> = (props) => {
  return (
    <Link href={props.href} className="grow p-2 text-center">
      {props.children}
    </Link>
  );
};
