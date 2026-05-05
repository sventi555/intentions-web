import {
  Bell,
  Close,
  Home,
  Logo,
  Pencil,
  Profile,
  Search,
} from '@/components/icons';
import { Icon } from '@/components/icons/icon';
import { useUser } from '@/hooks/users';
import { Route as feedRoute } from '@/routes/_app/_feed';
import { Route as draftRoute } from '@/routes/_app/draft';
import { Route as notificationsRoute } from '@/routes/_app/notifications';
import { Route as profileRoute } from '@/routes/_app/profile/$userId';
import { Route as searchRoute } from '@/routes/_app/search';
import { useSignedInAuthState } from '@/state/auth';
import { useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

export const NavButtons: React.FC = () => {
  const { authUser } = useSignedInAuthState();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser(authUser.uid);

  return (
    <nav className="fixed right-[28px] bottom-[28px] flex flex-col gap-[24px]">
      <AnimatePresence>
        {isOpen ? (
          <div className="flex flex-col gap-[8px]">
            <TabButton
              onClick={() =>
                navigate({
                  to: profileRoute.to,
                  params: { userId: authUser.uid },
                })
              }
              Icon={Profile}
              animate
            />
            <TabButton
              badge={user?.unreadNotifs}
              onClick={() => navigate({ to: notificationsRoute.to })}
              Icon={Bell}
              animate
            />
            <TabButton
              onClick={() => navigate({ to: searchRoute.to })}
              Icon={Search}
              animate
            />
            <TabButton
              onClick={() => navigate({ to: draftRoute.to })}
              Icon={Pencil}
              animate
            />
            <TabButton
              onClick={() => navigate({ to: feedRoute.to })}
              Icon={Home}
              animate
            />
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
