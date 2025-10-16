import { Post } from '../components/post';
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

  return (
    <div className="flex flex-col gap-1">
      {posts.map((post) => {
        const data = post.data;
        return (
          <Post
            createdAt={data.createdAt}
            intention={{ id: data.intentionId, name: data.intention.name }}
            author={{
              id: data.userId,
              username: data.user.username,
              dpUri: data.user.image,
            }}
            description={data.description}
            imageUri={data.image}
          />
        );
      })}
    </div>
  );
};
