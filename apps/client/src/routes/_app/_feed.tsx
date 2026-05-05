import { PostsList } from '@/components/posts-list';
import { useFeedPosts } from '@/hooks/posts';
import { Route as draftRoute } from '@/routes/_app/draft';
import { Route as searchRoute } from '@/routes/_app/search';
import { useSignedInAuthState } from '@/state/auth';
import { createFileRoute, Link } from '@tanstack/react-router';

const Feed: React.FC = () => {
  const { authUser } = useSignedInAuthState();
  const { posts, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useFeedPosts(authUser.uid);

  if (posts == null) {
    return null;
  }

  if (posts.length === 0) {
    return (
      <div className="flex grow flex-col items-center justify-center">
        <div>Nothing to show...</div>
        <Link to={searchRoute.to} className="underline">
          Follow someone
        </Link>{' '}
        <div>or</div>
        <Link to={draftRoute.to} className="underline">
          Post about an intention
        </Link>
      </div>
    );
  }

  return (
    <PostsList
      posts={posts}
      fetchNextPage={fetchNextPage}
      fetchingPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
    />
  );
};

export const Route = createFileRoute('/_app/_feed')({ component: Feed });
