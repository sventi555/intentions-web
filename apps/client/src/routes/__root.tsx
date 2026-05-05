import LogoUrl from '@/assets/images/why.svg';
import { Route as feedRoute } from '@/routes/_app/_feed';
import { RouterContext } from '@/state/router';
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from '@tanstack/react-router';
import '../index.css';

const RootComponent: React.FC = () => {
  const onClickHeader = () => {
    if (window.scrollY > 0) {
      window.scroll({ top: 0 });
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <div
        className="fixed top-0 right-0 left-0 z-20 flex h-[56px] items-center justify-center bg-[#2C3B4E]"
        onClick={onClickHeader}
      >
        <Link
          to={feedRoute.to}
          className="flex font-[courier] text-2xl tracking-widest text-[#f6f2e3]"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          wh
          <img className="size-[32px]" src={LogoUrl} />
        </Link>
      </div>

      <div className="mt-[56px] flex grow justify-center">
        <Outlet />
      </div>
    </div>
  );
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
