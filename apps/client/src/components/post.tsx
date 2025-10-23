import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Post as _Post } from 'lib';
import { Link } from 'wouter';
import { useDownloadUrl } from '../hooks/download-url';
import { useInvalidateIntentions } from '../hooks/intentions';
import {
  useDeletePost,
  useInvalidateFeedPosts,
  useInvalidateIntentionPosts,
  useInvalidateUserPosts,
} from '../hooks/posts';
import { useAuthState } from '../state/auth';
import { dayjs } from '../utils/time';
import { DisplayPic } from './display-pic';
import { EllipsesVert } from './icons';

interface PostProps {
  id: string;
  data: _Post;
}

export const Post: React.FC<PostProps> = ({ id, data }) => {
  const { downloadUrl: imageUrl } = useDownloadUrl(data.image);
  const authUser = useAuthState().authUser;

  const deletePost = useDeletePost();
  const invalidateUserPosts = useInvalidateUserPosts();
  const invalidateIntentionPosts = useInvalidateIntentionPosts();
  const invalidateIntentions = useInvalidateIntentions();
  const invalidateFeedPosts = useInvalidateFeedPosts();

  return (
    <div>
      <div className="relative flex flex-col gap-1 p-2">
        <div className="flex items-center gap-2">
          <Link href={`/profile/${data.userId}`}>
            <DisplayPic imageUri={data.user.image} size={40} />
          </Link>

          <div className="flex items-baseline gap-1">
            <Link href={`/profile/${data.userId}`}>{data.user.username}</Link>

            <div className="text-sm text-neutral-600">•</div>
            <div className="text-sm text-neutral-600">
              {dayjs().to(dayjs(data.createdAt))}
            </div>
          </div>
        </div>
        <Link
          href={`/profile/${data.userId}/intention/${data.intentionId}`}
          className="self-start rounded-sm border px-1"
        >
          {data.intention.name}
        </Link>
        {data.userId === authUser?.uid ? (
          <Menu>
            <MenuButton className="absolute top-2 right-2 cursor-pointer">
              <EllipsesVert />
            </MenuButton>
            <MenuItems anchor="bottom end" className="rounded bg-neutral-100">
              <MenuItem>
                <button
                  onClick={() =>
                    deletePost({ id }).then(() =>
                      Promise.all([
                        invalidateUserPosts(data.userId),
                        invalidateIntentionPosts(data.userId, data.intentionId),
                        invalidateIntentions(data.userId),
                        invalidateFeedPosts(data.userId),
                      ]),
                    )
                  }
                  className="cursor-pointer p-1 px-2 text-red-500 hover:bg-neutral-200"
                >
                  Delete
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
        ) : null}
      </div>

      <img src={imageUrl} />

      <div className="p-2">{data.description}</div>
    </div>
  );
};
