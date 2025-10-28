import { Link } from 'wouter';
import { PostsList } from '../components/posts-list';
import { useFeedPosts } from '../hooks/posts';
import { useAuthState } from '../state/auth';

export const Feed: React.FC = () => {
  const authUser = useAuthState().authUser;
  if (authUser == null) {
    throw new Error('Must be logged in to view feed');
  }
  const { posts, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useFeedPosts(authUser.uid);

  if (posts == null) {
    return null;
  }

  if (posts.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div>Nothing to show...</div>
        <Link href="/search" className="underline">
          Follow someone
        </Link>{' '}
        <div>or</div>
        <Link href="/create" className="underline">
          Post about an intention
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <PostsList
        posts={posts}
        fetchNextPage={fetchNextPage}
        fetchingPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
      />
    </div>
  );
};
