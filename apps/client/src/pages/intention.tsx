import { useParams } from 'wouter';
import { Header } from '../components/header';
import { PostsList } from '../components/posts-list';
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
    <div className="flex h-full flex-col">
      <Header>
        <div>{intention.user.username}&apos;s intention:</div>
        <div className="font-bold">{intention.name}</div>
      </Header>
      <div className="overflow-y-auto">
        <PostsList
          posts={posts}
          fetchNextPage={fetchNextPage}
          fetchingPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
        />
      </div>
    </div>
  );
};
