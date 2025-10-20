import { useParams } from 'wouter';
import { Post } from '../components/post';
import { useIntention } from '../hooks/intentions';
import { useIntentionPosts } from '../hooks/posts';

export const Intention: React.FC = () => {
  const { userId, intentionId } = useParams();

  if (userId == null || intentionId == null) {
    throw new Error('Intention page rendered without correct params');
  }

  const { intention } = useIntention(intentionId);
  const { posts } = useIntentionPosts(userId, intentionId);

  if (intention == null || posts == null) {
    return null;
  }

  return (
    <div>
      <div className="sticky top-0 border-b bg-white p-1">
        <div>{intention.data.user.username}&apos;s intention:</div>
        <div className="font-bold">{intention.data.name}</div>
      </div>
      {posts.map((post) => (
        <Post
          key={post.id}
          author={{
            id: post.data.userId,
            username: post.data.user.username,
            dpUri: post.data.user.image,
          }}
          createdAt={post.data.createdAt}
          intention={{
            id: post.data.intentionId,
            name: post.data.intention.name,
          }}
          imageUri={post.data.image}
          description={post.data.description}
        />
      ))}
    </div>
  );
};
