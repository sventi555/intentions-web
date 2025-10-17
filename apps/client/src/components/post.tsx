import { Link } from 'wouter';
import { useDownloadUrl } from '../hooks/download-url';
import { dayjs } from '../utils/time';

interface PostProps {
  author: {
    id: string;
    username: string;
    dpUri?: string;
  };
  createdAt: number;
  intention: {
    id: string;
    name: string;
  };
  imageUri?: string;
  description?: string;
}

export const Post: React.FC<PostProps> = (props) => {
  const { downloadUrl: dpUrl } = useDownloadUrl(props.author.dpUri);
  const { downloadUrl: imageUrl } = useDownloadUrl(props.imageUri);

  return (
    <div>
      <div className="flex flex-col gap-1 p-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Link href={`/profile/${props.author.id}`}>
              <img src={dpUrl} className="w-10 rounded-full" />
            </Link>
            <Link href={`/profile/${props.author.id}`}>
              {props.author.username}
            </Link>
          </div>
          <div>{dayjs().to(dayjs(props.createdAt))}</div>
        </div>
        <Link
          href={`/intention/${props.intention.id}`}
          className="self-start rounded-full border px-1"
        >
          {props.intention.name}
        </Link>
      </div>

      <img src={imageUrl} />

      <div className="p-1">{props.description}</div>
    </div>
  );
};
