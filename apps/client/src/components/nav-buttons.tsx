import clsx from 'clsx';
import { useState } from 'react';
import { useLocation } from 'wouter';

import {
  AddUser,
  Bell,
  Close,
  Home,
  Logo,
  Pencil,
  Profile,
} from '@/components/icons';
import { Icon } from '@/components/icons/icon';
import { useAuthState } from '@/state/auth';

export const NavButtons: React.FC = () => {
  const { authUser } = useAuthState();
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed right-[28px] bottom-[28px] flex flex-col gap-[24px]">
      {isOpen ? (
        <div className="flex flex-col gap-[8px]">
          <TabButton
            onClick={() =>
              navigate(
                authUser != null ? `/profile/${authUser?.uid}` : '/sign-in',
              )
            }
            Icon={Profile}
          />
          <TabButton onClick={() => navigate('/notifications')} Icon={Bell} />
          <TabButton onClick={() => navigate('/search')} Icon={AddUser} />
          <TabButton onClick={() => navigate('/create')} Icon={Pencil} />
          <TabButton onClick={() => navigate('/')} Icon={Home} />
        </div>
      ) : null}

      {isOpen ? (
        <TabButton onClick={() => setIsOpen(!isOpen)} Icon={Close} />
      ) : (
        <TabButton
          onClick={() => setIsOpen(!isOpen)}
          Icon={Logo}
          iconSize="large"
        />
      )}
    </nav>
  );
};

interface TabButtonProps {
  onClick: () => void;
  Icon: Icon;
  iconSize?: 'small' | 'large';
}

const TabButton: React.FC<TabButtonProps> = ({
  onClick,
  Icon,
  iconSize = 'small',
}) => {
  return (
    <button
      onClick={onClick}
      className="flex size-[44px] cursor-pointer flex-col items-center justify-center rounded-full border border-neutral-300 bg-white shadow"
    >
      <Icon
        className={clsx(
          'text-neutral-700',
          iconSize === 'small' ? 'size-[20px]' : 'size-[28px]',
        )}
      />
    </button>
  );
};
