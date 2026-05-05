import { Route as feedRoute } from '@/routes/_app/_feed';
import { createFileRoute, Outlet } from '@tanstack/react-router';

const AppLayout: React.FC = () => {
  return (
    <div className="flex w-full max-w-[540px] flex-col">
      <Outlet />
    </div>
  );
};

export const Route = createFileRoute('/_auth')({
  component: AppLayout,
  beforeLoad: async ({ context }) => {
    if (context.authState.authUser) {
      throw Route.redirect({ to: feedRoute.to });
    }
  },
});
