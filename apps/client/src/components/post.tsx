import {
  Dialog,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';
import { clsx } from 'clsx';
import { intlFormatDistance } from 'date-fns';
import { Post as _Post } from 'lib';
import { useState } from 'react';
import { Link } from 'wouter';
import { useComments, useInvalidateComments } from '../hooks/comments';
import { useDownloadUrl } from '../hooks/download-url';
import { useInvalidateIntentions } from '../hooks/intentions';
import {
  useInvalidateFeedPosts,
  useInvalidateIntentionPosts,
  useInvalidateUserPosts,
} from '../hooks/posts';
import {
  useCreateComment,
  useDeleteComment,
  useDeletePost,
} from '../intentions-api';
import { useAuthState } from '../state/auth';
import { DisplayPic } from './display-pic';
import { EllipsesVert, Loading, Send } from './icons';

interface PostProps {
  id: string;
  data: _Post;
}

export const Post: React.FC<PostProps> = ({ id, data }) => {
  const { downloadUrl: imageUrl } = useDownloadUrl(data.image);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { authUser, token } = useAuthState();

  const { mutateAsync: deletePost } = useDeletePost();
  const invalidateUserPosts = useInvalidateUserPosts();
  const invalidateIntentionPosts = useInvalidateIntentionPosts();
  const invalidateIntentions = useInvalidateIntentions();
  const invalidateFeedPosts = useInvalidateFeedPosts();

  const [commentDialogOpen, setCommentDialogOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <div className="relative p-2">
        <div
          className={clsx(
            'flex flex-wrap items-center gap-2',
            data.userId === authUser?.uid && 'pr-4',
          )}
        >
          <Link
            href={`/profile/${data.userId}`}
            className="flex items-center gap-2"
          >
            <DisplayPic size={36} imageUri={data.user.image} />
            <div className="font-medium">{data.user.username}</div>
          </Link>

          <Link
            href={`/profile/${data.userId}/intention/${data.intentionId}`}
            className="self-center rounded-[32px] border border-neutral-300 p-1 px-2 whitespace-nowrap"
          >
            {data.intention.name}
          </Link>
        </div>
        {data.userId === authUser?.uid ? (
          <Menu>
            <MenuButton className="absolute top-[14px] right-0 cursor-pointer">
              <EllipsesVert className="text-neutral-600" />
            </MenuButton>
            <MenuItems
              anchor="bottom end"
              className="rounded border border-neutral-400 bg-neutral-100 shadow-sm"
            >
              <MenuItem>
                <button
                  onClick={() =>
                    deletePost({
                      headers: { authorization: token ?? '' },
                      id,
                    }).then(() =>
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

      {data.image && !imageLoaded ? (
        <div className="aspect-square w-full animate-pulse rounded-2xl bg-neutral-300" />
      ) : null}

      {imageUrl ? (
        <img
          className={clsx('rounded-2xl', !imageLoaded && 'hidden')}
          src={imageUrl}
          onLoad={() => setImageLoaded(true)}
        />
      ) : null}

      <div className="p-2">
        <div>{data.description}</div>
        <button
          className="cursor-pointer text-neutral-400"
          onClick={() => setCommentDialogOpen(true)}
        >
          View comments...
        </button>
      </div>

      <div className="self-end text-sm text-neutral-400 italic">
        {intlFormatDistance(data.createdAt, Date.now(), { style: 'short' })}
      </div>

      {commentDialogOpen && (
        <CommentsDialog
          postId={id}
          open={commentDialogOpen}
          setOpen={setCommentDialogOpen}
        />
      )}
    </div>
  );
};

interface CommentsDialogProps {
  postId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CommentsDialog: React.FC<CommentsDialogProps> = ({
  postId,
  open,
  setOpen,
}) => {
  const { authUser, token } = useAuthState();

  const { comments } = useComments(postId);
  const { mutateAsync: createComment } = useCreateComment();
  const { mutateAsync: deleteComment } = useDeleteComment();
  const invalidateComments = useInvalidateComments();
  const [draftComment, setDraftComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const onCreateComment = () => {
    if (draftComment.trim()) {
      setSubmittingComment(true);
      createComment({
        headers: { authorization: token ?? '' },
        data: { postId, body: draftComment },
      })
        .then(() => invalidateComments(postId))
        .then(() => {
          setDraftComment('');
          setSubmittingComment(false);
        });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 flex items-center justify-center bg-black/20 p-4">
        <DialogPanel className="relative flex h-1/2 w-full max-w-[540px] flex-col overflow-hidden rounded-lg bg-white">
          <div className="flex grow flex-col gap-2 overflow-hidden overflow-y-scroll p-4">
            {comments?.map((c) => (
              <div key={c.id} className="flex justify-between">
                <div className="flex grow gap-2">
                  <Link href={`/profile/${c.data.userId}`}>
                    <DisplayPic imageUri={c.data.user.image} size={32} />
                  </Link>
                  <div className="text-sm">
                    <div>
                      <Link
                        href={`/profile/${c.data.userId}`}
                        className="font-semibold"
                      >
                        {c.data.user.username}
                      </Link>{' '}
                      {c.data.body}
                    </div>
                    <div className="text-xs text-neutral-400 italic">
                      {intlFormatDistance(c.data.createdAt, Date.now(), {
                        style: 'short',
                      })}
                    </div>
                  </div>
                </div>
                {authUser?.uid === c.data.userId && (
                  <div className="pt-1.5">
                    <Menu>
                      <MenuButton className="cursor-pointer">
                        <EllipsesVert className="size-[20px] text-neutral-500" />
                      </MenuButton>
                      <MenuItems
                        anchor="bottom end"
                        className="rounded border border-neutral-400 bg-neutral-100 shadow-sm"
                      >
                        <MenuItem>
                          <button
                            onClick={() =>
                              deleteComment({
                                headers: { authorization: token ?? '' },
                                id: c.id,
                              }).then(() =>
                                Promise.all([invalidateComments(postId)]),
                              )
                            }
                            className="cursor-pointer p-1 px-2 text-red-500 hover:bg-neutral-200"
                          >
                            Delete
                          </button>
                        </MenuItem>
                      </MenuItems>
                    </Menu>
                  </div>
                )}
              </div>
            ))}
            <div className="self-center text-sm text-neutral-400">
              No more comments...
            </div>
          </div>
          <div className="flex justify-between border-t border-neutral-300 p-1">
            <textarea
              placeholder="Add comment..."
              disabled={submittingComment}
              value={draftComment}
              onChange={(e) => {
                setDraftComment(e.target.value);
              }}
              className="field-sizing-content max-h-[180px] grow resize-none p-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  onCreateComment();
                  e.currentTarget.blur();

                  // don't call onChange after this
                  e.preventDefault();
                }
              }}
            />
            <button
              className="cursor-pointer p-2"
              onClick={onCreateComment}
              disabled={submittingComment}
            >
              {submittingComment ? (
                <Loading className="animate-spin text-neutral-400" />
              ) : (
                <Send className="text-neutral-600" />
              )}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
