import { useParams } from 'wouter';
import { PostsList } from '../components/posts-list';
import { StickyHeader } from '../components/sticky-header';
import { useIntention } from '../hooks/intentions';
import { useIntentionPosts } from '../hooks/posts';

export const Intention: React.FC = () => {
  const { userId, intentionId } = useParams();

  if (userId == null || intentionId == null) {
    throw new Error('Intention page rendered without correct params');
  }

  const { intention } = useIntention(intentionId);
  const { posts, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useIntentionPosts(userId, intentionId);

  if (intention == null || posts == null) {
    return null;
  }

  return (
    <div>
      <StickyHeader>
        {intention.user.username}&apos;s intention: <b>{intention.name}</b>
      </StickyHeader>
      <PostsList
        posts={posts}
        fetchNextPage={fetchNextPage}
        fetchingPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
      />
    </div>
  );
};
