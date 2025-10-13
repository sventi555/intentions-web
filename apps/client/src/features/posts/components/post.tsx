import { useQuery } from '@tanstack/react-query';
import { dayjs } from '../../../utils/time';

interface PostProps {
  author: {
    id: string;
    username: string;
    dpStoragePath?: string;
  };
  createdAt: number;
  intention: {
    id: string;
    name: string;
  };
  imageStoragePath?: string;
  description?: string;
}

export const Post: React.FC<PostProps> = (props) => {
  const { data: dpUrl } = useQuery({
    enabled: props.author.dpStoragePath != null,
    queryKey: ['storage', props.author.dpStoragePath],
    queryFn: async () => {
      return 'https://placehold.co/32x32/png';
    },
  });

  const { data: imageUrl } = useQuery({
    enabled: props.imageStoragePath != null,
    queryKey: ['storage', props.imageStoragePath],
    queryFn: async () => {
      return 'https://placehold.co/600x600/png';
    },
  });

  return (
    <div className="rounded-sm border-2">
      <div className="flex flex-col gap-1 p-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <img src={dpUrl} className="rounded-full" />
            <div>{props.author.username}</div>
          </div>
          <div>{dayjs().to(dayjs(props.createdAt))}</div>
        </div>
        <div className="self-start rounded-sm border-2 p-1">
          {props.intention.name}
        </div>
      </div>

      <img src={imageUrl} />

      <div className="p-1">{props.description}</div>
    </div>
  );
};
