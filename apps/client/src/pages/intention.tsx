import { useParams } from 'wouter';
import { PostsList } from '../components/posts-list';
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
        <div>{intention.user.username}&apos;s intention:</div>
        <div className="font-bold">{intention.name}</div>
      </div>
      <PostsList posts={posts} />
    </div>
  );
};
