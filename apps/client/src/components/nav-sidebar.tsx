import { Bell, Home, Pencil, Profile, Search } from '@/components/icons';
import { Icon } from '@/components/icons/icon';
import { useUser } from '@/hooks/users';
import { Route as feedRoute } from '@/routes/_app/_feed';
import { Route as draftRoute } from '@/routes/_app/draft';
import { Route as notificationsRoute } from '@/routes/_app/notifications';
import { Route as profileRoute } from '@/routes/_app/profile/$userId';
import { Route as searchRoute } from '@/routes/_app/search';
import { useSignedInAuthState } from '@/state/auth';
import { useNavigate } from '@tanstack/react-router';

export const NavSidebar: React.FC = () => {
  const { authUser } = useSignedInAuthState();
  const navigate = useNavigate();

  const { user } = useUser(authUser.uid);

  return (
    <nav className="flex grow flex-col gap-[40px] border-r border-neutral-300 p-[16px]">
      <SidebarButton
        Icon={Home}
        onClick={() => navigate({ to: feedRoute.to })}
      />
      <SidebarButton
        Icon={Pencil}
        onClick={() => navigate({ to: draftRoute.to })}
      />
      <SidebarButton
        Icon={Search}
        onClick={() => navigate({ to: searchRoute.to })}
      />
      <SidebarButton
        badge={user?.unreadNotifs}
        Icon={Bell}
        onClick={() => navigate({ to: notificationsRoute.to })}
      />
      <SidebarButton
        Icon={Profile}
        onClick={() =>
          navigate({ to: profileRoute.to, params: { userId: authUser.uid } })
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
