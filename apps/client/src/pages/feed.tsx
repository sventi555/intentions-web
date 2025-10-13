import { Post } from '../features/posts/components/post';

export const Feed: React.FC = () => {
  return (
    <div className="flex flex-col gap-1">
      {[1, 2, 3].map((i) => (
        <Post
          key={i}
          author={{
            id: 'user-id',
            username: 'user-1',
            dpStoragePath: 'dp-path',
          }}
          createdAt={1760387159012}
          intention={{ id: 'intention-id', name: 'taste' }}
          imageStoragePath="image-path"
          description="post description"
        />
      ))}
    </div>
  );
};
