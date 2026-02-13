import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
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
import { useUser } from '@/hooks/users';
import { useAuthState } from '@/state/auth';

export const NavButtons: React.FC = () => {
  const { authUser } = useAuthState();
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser(authUser?.uid);

  return (
    <nav className="fixed right-[28px] bottom-[28px] flex flex-col gap-[24px]">
      <AnimatePresence>
        {isOpen ? (
          <div className="flex flex-col gap-[8px]">
            <TabButton
              onClick={() =>
                navigate(
                  authUser != null ? `~/profile/${authUser?.uid}` : '~/sign-in',
                )
              }
              Icon={Profile}
              animate
            />
            <TabButton
              badge={user?.unreadNotifs}
              onClick={() => navigate('~/notifications')}
              Icon={Bell}
              animate
            />
            <TabButton
              onClick={() => navigate('~/search')}
              Icon={AddUser}
              animate
            />
            <TabButton
              onClick={() => navigate('~/draft')}
              Icon={Pencil}
              animate
            />
            <TabButton onClick={() => navigate('~/')} Icon={Home} animate />
          </div>
        ) : null}
      </AnimatePresence>

      {isOpen ? (
        <TabButton onClick={() => setIsOpen(!isOpen)} Icon={Close} />
      ) : (
        <TabButton
          onClick={() => setIsOpen(!isOpen)}
          Icon={Logo}
          iconSize="large"
          badge={user?.unreadNotifs}
        />
      )}
    </nav>
  );
};

interface TabButtonProps {
  onClick: () => void;
  Icon: Icon;
  iconSize?: 'small' | 'large';
  badge?: boolean;
  animate?: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({
  onClick,
  Icon,
  iconSize = 'small',
  badge,
  animate,
}) => {
  return (
    <motion.button
      initial={animate ? { opacity: 0, translateY: 10 } : undefined}
      animate={animate ? { opacity: 1, translateY: 0 } : undefined}
      exit={animate ? { opacity: 0, translateY: 10 } : undefined}
      onClick={onClick}
      className="relative flex size-[44px] cursor-pointer flex-col items-center justify-center rounded-full border border-neutral-300 bg-white shadow"
    >
      <Icon
        className={clsx(
          'text-neutral-700',
          iconSize === 'small' ? 'size-[20px]' : 'size-[28px]',
        )}
      />
      {badge ? (
        <div className="absolute top-0.5 right-0.5 size-2 rounded-full bg-red-600/80" />
      ) : null}
    </motion.button>
  );
};
