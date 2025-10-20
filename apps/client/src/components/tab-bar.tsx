import { PropsWithChildren } from 'react';
import { Link } from 'wouter';
import { useAuthState } from '../state/auth';
import { Bell, Home, Pencil, Profile, Search } from './icons';

export const TabBar: React.FC = () => {
  const { authUser } = useAuthState();

  return (
    <nav className="fixed bottom-0 flex w-full">
      <TabButton href="/">
        <Home />
      </TabButton>
      <TabButton href="/search">
        <Search />
      </TabButton>
      <TabButton href="/create">
        <Pencil />
      </TabButton>
      <TabButton href="/notifications">
        <Bell />
      </TabButton>
      <TabButton
        href={authUser != null ? `/profile/${authUser?.uid}` : '/sign-in'}
      >
        <Profile />
      </TabButton>
    </nav>
  );
};

interface TabButtonProps {
  href: string;
}

const TabButton: React.FC<PropsWithChildren<TabButtonProps>> = (props) => {
  return (
    <Link href={props.href} className="flex grow justify-center p-2">
      {props.children}
    </Link>
  );
};
