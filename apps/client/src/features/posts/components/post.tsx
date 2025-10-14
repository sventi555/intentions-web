import { dayjs } from '../../../utils/time';
import { useDownloadUrl } from '../../media/hooks/download-url';

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
    <div className="rounded-sm border-2">
      <div className="flex flex-col gap-1 p-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <img src={dpUrl} className="w-10 rounded-full" />
            <div>{props.author.username}</div>
          </div>
          <div>{dayjs().to(dayjs(props.createdAt))}</div>
        </div>
        <div className="self-start rounded-full border-2 px-1">
          {props.intention.name}
        </div>
      </div>

      <img src={imageUrl} />

      <div className="p-1">{props.description}</div>
    </div>
  );
};
