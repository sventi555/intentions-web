import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { clsx } from 'clsx';
import { intlFormatDistance } from 'date-fns';
import { Post as _Post } from 'lib';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Link } from 'wouter';

import { performMutation } from '@/actions';
import { authErrorMessage } from '@/actions/errors';
import { Dialog } from '@/components/atoms/dialog';
import { DisplayPic } from '@/components/display-pic';
import { EllipsesVert, Loading, Send } from '@/components/icons';
import { useComments, useInvalidateComments } from '@/hooks/comments';
import { useDownloadUrl } from '@/hooks/download-url';
import { useInfiniteScroll } from '@/hooks/infinite-scroll';
import { useInvalidateIntentions } from '@/hooks/intentions';
import {
  useInvalidateFeedPosts,
  useInvalidateIntentionPosts,
  useInvalidateUserPosts,
} from '@/hooks/posts';
import {
  useCreateComment,
  useDeleteComment,
  useDeletePost,
} from '@/intentions-api';
import { useAuthState } from '@/state/auth';
import { defaultTransition } from '@/style';

interface PostProps {
  id: string;
  data: _Post;
}

export const Post: React.FC<PostProps> = ({ id, data }) => {
  const { downloadUrl: imageUrl } = useDownloadUrl(data.image?.src);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { authUser, token } = useAuthState();

  const { mutateAsync: deletePost } = useDeletePost();
  const [isDeleting, setIsDeleting] = useState(false);
  const invalidateUserPosts = useInvalidateUserPosts();
  const invalidateIntentionPosts = useInvalidateIntentionPosts();
  const invalidateIntentions = useInvalidateIntentions();
  const invalidateFeedPosts = useInvalidateFeedPosts();

  const [commentDialogOpen, setCommentDialogOpen] = useState(false);

  return (
    <>
      <div className="relative flex flex-col p-2">
        <div className="relative p-2">
          <div
            className={clsx(
              'flex flex-wrap items-center gap-2',
              data.userId === authUser?.uid && 'pr-4',
            )}
          >
            <Link
              href={`~/profile/${data.userId}`}
              className="flex items-center gap-2"
            >
              <DisplayPic size={36} imageUri={data.user.image} />
              <div className="font-medium">{data.user.username}</div>
            </Link>

            <Link
              href={`~/profile/${data.userId}/intention/${data.intentionId}`}
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
                    onClick={() => {
                      performMutation({
                        mutate: () =>
                          deletePost({
                            headers: { authorization: token ?? '' },
                            id,
                          }),
                        setLoading: setIsDeleting,
                        errorMessages: {
                          401: authErrorMessage,
                        },
                        onSuccess: () =>
                          Promise.all([
                            invalidateUserPosts(data.userId),
                            invalidateIntentionPosts(
                              data.userId,
                              data.intentionId,
                            ),
                            invalidateIntentions(data.userId),
                            invalidateFeedPosts(data.userId),
                          ]),
                      });
                    }}
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
          <div
            style={{
              aspectRatio: `${data.image.width} / ${data.image.height}`,
            }}
            className="w-full animate-pulse rounded-2xl bg-neutral-300"
          />
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

        {isDeleting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...defaultTransition, delay: 0.25 }}
            className="absolute inset-0 flex items-center justify-center rounded-md bg-neutral-200/50"
          >
            <div className="flex max-h-full flex-col items-center rounded-md bg-neutral-200/80 p-2 shadow-sm">
              <Loading className="size-[40px] animate-spin" />
              <div>Deleting</div>
            </div>
          </motion.div>
        )}
      </div>

      <CommentsDialog
        postId={id}
        open={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
      />
    </>
  );
};

interface CommentsDialogProps {
  postId: string;
  open: boolean;
  onClose: () => void;
}

const CommentsDialog: React.FC<CommentsDialogProps> = ({
  postId,
  open,
  onClose,
}) => {
  const { authUser, token } = useAuthState();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const { comments, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useComments(postId);
  const { mutateAsync: createComment } = useCreateComment();
  const { mutateAsync: deleteComment } = useDeleteComment();
  const invalidateComments = useInvalidateComments();
  const [draftComment, setDraftComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null,
  );

  const onCreateComment = () => {
    if (draftComment.trim()) {
      performMutation({
        mutate: () =>
          createComment({
            headers: { authorization: token ?? '' },
            data: { postId, body: draftComment },
          }),
        setLoading: setSubmittingComment,
        errorMessages: {
          401: authErrorMessage,
          404: 'Could not create comment - post does not exist.',
        },
        onSuccess: () =>
          invalidateComments(postId).then(() => {
            setDraftComment('');
          }),
      });
    }
  };

  useInfiniteScroll({
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    container,
  });

  return (
    <Dialog open={open} onClose={onClose}>
      <div
        ref={(e) => setContainer(e)}
        className="flex grow flex-col overflow-hidden overflow-y-scroll p-3"
      >
        {comments?.map((c) => (
          <div key={c.id} className="relative flex justify-between p-1">
            <div className="flex grow gap-2">
              <Link href={`~/profile/${c.data.userId}`}>
                <DisplayPic imageUri={c.data.user.image} size={32} />
              </Link>
              <div className="text-sm">
                <div>
                  <Link
                    href={`~/profile/${c.data.userId}`}
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
                        onClick={() => {
                          performMutation({
                            mutate: () =>
                              deleteComment({
                                headers: { authorization: token ?? '' },
                                id: c.id,
                              }),
                            setLoading: (loading) =>
                              setDeletingCommentId(loading ? c.id : null),
                            errorMessages: {
                              401: authErrorMessage,
                            },
                            onSuccess: () => invalidateComments(postId),
                          });
                        }}
                        className="cursor-pointer p-1 px-2 text-red-500 hover:bg-neutral-200"
                      >
                        Delete
                      </button>
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </div>
            )}
            {deletingCommentId === c.id && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...defaultTransition, delay: 0.25 }}
                className="absolute inset-0 flex items-center justify-center rounded-md bg-neutral-200/30 p-1"
              >
                <div className="flex max-h-full flex-col flex-wrap items-center justify-center gap-1 rounded-md bg-white p-1 shadow-sm">
                  <Loading className="size-[20px] animate-spin" />
                  <div>Deleting</div>
                </div>
              </motion.div>
            )}
          </div>
        ))}

        {comments?.length === 0 && (
          <div className="self-center p-1 text-sm text-neutral-400">
            No comments...
          </div>
        )}
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
    </Dialog>
  );
};
