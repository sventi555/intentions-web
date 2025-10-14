import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Post } from '../components/post';

export const Intention: React.FC = () => {
  const { intentionId } = useParams();

  if (intentionId == null) {
    throw new Error('Intention page rendered without id');
  }

  const { data: intention } = useQuery({
    queryKey: ['intention', intentionId],
    queryFn: () => ({
      author: { id: 'test', username: 'booga' },
      name: 'touch grass',
    }),
  });

  const { data: intentionPosts } = useQuery({
    enabled: intention != null,
    queryKey: ['posts', { intentionId: intentionId }],
    queryFn: () => [1, 2, 3],
  });

  if (intention == null || intentionPosts == null) {
    return null;
  }

  return (
    <div>
      <div className="sticky top-0 border-b bg-white p-1">
        <div>{intention.author.username}&apos;s intention:</div>
        <div className="font-bold">{intention.name}</div>
      </div>
      {intentionPosts.map((i) => (
        <Post
          key={i}
          author={{
            id: 'user-id',
            username: 'user-1',
            dpUri: 'dp-path',
          }}
          createdAt={1760387159012}
          intention={{ id: 'intention-id', name: 'taste' }}
          imageUri="image-path"
          description="post description"
        />
      ))}
    </div>
  );
};
