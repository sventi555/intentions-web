import { useLocation } from 'wouter';

import { AddUser, Bell, Home, Pencil, Profile } from '@/components/icons';
import { Icon } from '@/components/icons/icon';
import { useUser } from '@/hooks/users';
import { useAuthState } from '@/state/auth';

export const NavSidebar: React.FC = () => {
  const { authUser } = useAuthState();
  const [, navigate] = useLocation();

  const { user } = useUser(authUser?.uid);

  return (
    <nav className="flex grow flex-col gap-[40px] border-r border-neutral-300 p-[16px]">
      <SidebarButton Icon={Home} onClick={() => navigate('~/')} />
      <SidebarButton Icon={Pencil} onClick={() => navigate('~/draft')} />
      <SidebarButton Icon={AddUser} onClick={() => navigate('~/search')} />
      <SidebarButton
        badge={user?.unreadNotifs}
        Icon={Bell}
        onClick={() => navigate('~/notifications')}
      />
      <SidebarButton
        Icon={Profile}
        onClick={() =>
          navigate(
            authUser != null ? `~/profile/${authUser?.uid}` : '~/sign-in',
          )
        }
      />
    </nav>
  );
};

interface SidebarButtonProps {
  onClick: () => void;
  Icon: Icon;
  badge?: boolean;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({
  onClick,
  Icon,
  badge,
}) => {
  return (
    <button className="relative cursor-pointer" onClick={onClick}>
      <Icon className="text-neutral-700" />
      {badge ? (
        <div className="absolute -top-1 -right-1 size-2 rounded-full bg-red-600/80" />
      ) : null}
    </button>
  );
};
