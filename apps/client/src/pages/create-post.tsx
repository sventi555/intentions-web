import { useRef, useState } from 'react';
import { Link, Redirect, useLocation } from 'wouter';
import { Button } from '../components/button';
import { ImagePicker } from '../components/image-picker';
import { useIntentions } from '../hooks/intentions';
import {
  useCreatePost,
  useInvalidateFeedPosts,
  useInvalidateIntentionPosts,
  useInvalidateUserPosts,
} from '../hooks/posts';
import { useAuthState } from '../state/auth';

export const CreatePost: React.FC = () => {
  const authUser = useAuthState().authUser;

  if (authUser == null) {
    throw new Error('Must be logged in to view create post page');
  }

  const { intentions } = useIntentions(authUser.uid);
  const [selectedIntentionId, setSelectedIntentionId] = useState<string | null>(
    null,
  );
  const [description, setDescription] = useState('');
  const filePickerRef = useRef<HTMLInputElement | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  const createPost = useCreatePost();
  const [, setLocation] = useLocation();
  const invalidateFeedPosts = useInvalidateFeedPosts();
  const invalidateUserPosts = useInvalidateUserPosts();
  const invalidateIntentionPosts = useInvalidateIntentionPosts();

  if (intentions == null) {
    return null;
  }

  if (intentions.length === 0) {
    return <Redirect to="/create/intention" />;
  }

  const computedIntentionId = selectedIntentionId || intentions[0].id;

  return (
    <div className="flex flex-col gap-1 p-1">
      <div className="flex flex-col">
        <label>Choose an intention:</label>
        <div className="flex gap-1">
          <select
            onChange={(e) => setSelectedIntentionId(e.target.value)}
            value={computedIntentionId}
            className="grow cursor-pointer rounded-sm border"
          >
            {intentions.map(({ id, data }) => (
              <option value={id} key={id}>
                {data.name}
              </option>
            ))}
          </select>
          <Link href="/create/intention" className="rounded-lg border px-2">
            +
          </Link>
        </div>
      </div>

      <ImagePicker
        onPick={(dataUrl) => setImageDataUrl(dataUrl)}
        ref={filePickerRef}
      />

      {imageDataUrl == null ? (
        <button
          onClick={() => filePickerRef.current?.click()}
          className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-sm border"
        >
          <div>Select an image</div>
        </button>
      ) : (
        <div className="relative">
          <img src={imageDataUrl} className="w-full" />
          <button
            onClick={() => filePickerRef.current?.click()}
            className="absolute right-2 bottom-2 left-2 cursor-pointer rounded-sm bg-black/40 p-1 text-white"
          >
            Change image
          </button>
        </div>
      )}

      <textarea
        placeholder="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="h-24 rounded-sm border p-1"
      />

      <Button
        type="primary"
        onClick={() =>
          createPost({
            body: {
              intentionId: computedIntentionId,
              description,
              ...(imageDataUrl != null ? { image: imageDataUrl } : {}),
            },
          })
            .then(() =>
              Promise.all([
                invalidateUserPosts(authUser.uid),
                invalidateFeedPosts(authUser.uid),
                invalidateIntentionPosts(authUser.uid, computedIntentionId),
              ]),
            )
            .then(() => setLocation('/'))
        }
      >
        Create
      </Button>
    </div>
  );
};
