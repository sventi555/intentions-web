import { PostsList } from '../components/posts-list';
import { useFeedPosts } from '../hooks/posts';
import { useAuthState } from '../state/auth';

export const Feed: React.FC = () => {
  const authUser = useAuthState().authUser;
  if (authUser == null) {
    throw new Error('Must be logged in to view feed');
  }
  const { posts } = useFeedPosts(authUser.uid);

  if (posts == null) {
    return null;
  }

  return <PostsList posts={posts} />;
};
