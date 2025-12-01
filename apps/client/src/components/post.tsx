import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { intlFormatDistance } from 'date-fns';
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
    <div className="flex flex-col">
      <div className="relative p-2">
        <div className="flex items-center gap-1">
          <Link
            href={`/profile/${data.userId}`}
            className="flex items-center gap-2"
          >
            <DisplayPic size={36} imageUri={data.user.image} />
            <div>{data.user.username}</div>
          </Link>

          <div className="text-sm text-neutral-300">•</div>

          <Link
            href={`/profile/${data.userId}/intention/${data.intentionId}`}
            className="self-center rounded-[32px] border border-neutral-300 p-1 px-2"
          >
            {data.intention.name}
          </Link>

          {/* <div className="text-sm text-neutral-300">•</div> */}
        </div>
        {data.userId === authUser?.uid ? (
          <Menu>
            <MenuButton className="absolute top-2 right-2 cursor-pointer">
              <EllipsesVert className="text-neutral-600" />
            </MenuButton>
            <MenuItems
              anchor="bottom end"
              className="rounded border border-neutral-400 bg-neutral-100 shadow-sm"
            >
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

      <img className="rounded-2xl" src={imageUrl} />

      <div className="p-2">{data.description}</div>

      <div className="self-end text-sm text-neutral-400 italic">
        {intlFormatDistance(data.createdAt, Date.now(), { style: 'short' })}
      </div>
    </div>
  );
};
