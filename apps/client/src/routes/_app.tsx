import { NavButtons } from '@/components/nav-buttons';
import { NavSidebar } from '@/components/nav-sidebar';
import { Route as signInRoute } from '@/routes/_auth/sign-in';
import { useAuthState } from '@/state/auth';
import { createFileRoute, Outlet } from '@tanstack/react-router';

const AppLayout: React.FC = () => {
  const { authUser } = useAuthState();

  // unload app while router catches up to auth state
  if (!authUser) {
    return null;
  }

  return (
    <>
      <div className="hidden sm:fixed sm:top-[56px] sm:bottom-0 sm:left-0 sm:flex sm:flex-col">
        <NavSidebar />
      </div>

      <div className="flex w-full max-w-[540px] flex-col sm:ml-[56px]">
        <Outlet />
      </div>

      <div className="block sm:hidden">
        <NavButtons />
      </div>
    </>
  );
};

export const Route = createFileRoute('/_app')({
  component: AppLayout,
  beforeLoad: async ({ context }) => {
    if (!context.authState.authUser) {
      throw Route.redirect({ to: signInRoute.to });
    }
  },
});
