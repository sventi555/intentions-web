import { Post as _Post } from 'lib';
import { Link } from 'wouter';
import { useDownloadUrl } from '../hooks/download-url';
import { dayjs } from '../utils/time';
import { DisplayPic } from './display-pic';

interface PostProps {
  data: _Post;
}

export const Post: React.FC<PostProps> = ({ data }) => {
  const { downloadUrl: imageUrl } = useDownloadUrl(data.image);

  return (
    <div>
      <div className="flex flex-col gap-1 p-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Link href={`/profile/${data.userId}`}>
              <DisplayPic imageUri={data.user.image} size={40} />
            </Link>
            <Link href={`/profile/${data.userId}`}>{data.user.username}</Link>
          </div>
          <div>{dayjs().to(dayjs(data.createdAt))}</div>
        </div>
        <Link
          href={`/intention/${data.intentionId}`}
          className="self-start rounded-full border px-1"
        >
          {data.intention.name}
        </Link>
      </div>

      <img src={imageUrl} />

      <div className="p-1">{data.description}</div>
    </div>
  );
};
