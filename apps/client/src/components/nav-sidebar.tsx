import { useLocation } from 'wouter';
import { useAuthState } from '../state/auth';
import { AddUser, Bell, Home, Pencil, Profile } from './icons';
import { Icon } from './icons/icon';

export const NavSidebar: React.FC = () => {
  const { authUser } = useAuthState();
  const [, navigate] = useLocation();

  return (
    <nav className="flex grow flex-col gap-[40px] border-r border-neutral-300 p-[16px]">
      <SidebarButton Icon={Home} onClick={() => navigate('/')} />
      <SidebarButton Icon={Pencil} onClick={() => navigate('/create')} />
      <SidebarButton Icon={AddUser} onClick={() => navigate('/search')} />
      <SidebarButton Icon={Bell} onClick={() => navigate('/notifications')} />
      <SidebarButton
        Icon={Profile}
        onClick={() =>
          navigate(authUser != null ? `/profile/${authUser?.uid}` : '/sign-in')
        }
      />
    </nav>
  );
};

interface SidebarButtonProps {
  onClick: () => void;
  Icon: Icon;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ onClick, Icon }) => {
  return (
    <button className="cursor-pointer" onClick={onClick}>
      <Icon className="text-neutral-700" />
    </button>
  );
};
