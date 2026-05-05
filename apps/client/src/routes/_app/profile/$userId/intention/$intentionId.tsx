import { PageHeader } from '@/components/page-header';
import { PostsList } from '@/components/posts-list';
import { useIntention } from '@/hooks/intentions';
import { useIntentionPosts } from '@/hooks/posts';
import { createFileRoute } from '@tanstack/react-router';

const Intention: React.FC = () => {
  const { userId, intentionId } = Route.useParams();

  const { intention } = useIntention(intentionId);
  const { posts, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useIntentionPosts(userId, intentionId);

  if (intention == null || posts == null) {
    return null;
  }

  return (
    <div>
      <PageHeader title={intention.name} />

      <PostsList
        posts={posts}
        fetchNextPage={fetchNextPage}
        fetchingPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
      />
    </div>
  );
};

export const Route = createFileRoute(
  '/_app/profile/$userId/intention/$intentionId',
)({ component: Intention });
