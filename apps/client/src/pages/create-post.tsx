import { useRef, useState } from 'react';
import { SubmitHandler, useController, useForm } from 'react-hook-form';
import { Link, Redirect, useLocation } from 'wouter';
import { ImagePicker } from '../components/image-picker';
import { Submit } from '../components/submit';
import { TextArea } from '../components/text-area';
import { useIntentions } from '../hooks/intentions';
import {
  useCreatePost,
  useInvalidateFeedPosts,
  useInvalidateIntentionPosts,
  useInvalidateUserPosts,
} from '../hooks/posts';
import { useAuthState } from '../state/auth';

// no need to control intentionId since it's always set
type Inputs = {
  image: string;
  description: string;
};

export const CreatePost: React.FC = () => {
  const authUser = useAuthState().authUser;

  if (authUser == null) {
    throw new Error('Must be logged in to view create post page');
  }

  const { intentions } = useIntentions(authUser.uid);
  const [selectedIntentionId, setSelectedIntentionId] = useState<string | null>(
    null,
  );
  const filePickerRef = useRef<HTMLInputElement | null>(null);

  const createPost = useCreatePost();
  const [, setLocation] = useLocation();
  const invalidateFeedPosts = useInvalidateFeedPosts();
  const invalidateUserPosts = useInvalidateUserPosts();
  const invalidateIntentionPosts = useInvalidateIntentionPosts();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();
  const { field: imageField } = useController<Inputs>({
    name: 'image',
    control,
    rules: { deps: ['description'] },
  });

  if (intentions == null) {
    return null;
  }

  if (intentions.length === 0) {
    return <Redirect to="/create/intention" replace={true} />;
  }

  const computedIntentionId = selectedIntentionId || intentions[0].id;

  const onSubmit: SubmitHandler<Inputs> = (data) =>
    createPost({
      body: {
        intentionId: computedIntentionId,
        description: data.description,
        ...(imageField.value ? { image: imageField.value } : {}),
      },
    })
      .then(() =>
        Promise.all([
          invalidateUserPosts(authUser.uid),
          invalidateFeedPosts(authUser.uid),
          invalidateIntentionPosts(authUser.uid, computedIntentionId),
        ]),
      )
      .then(() => setLocation('/'));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2 p-2">
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

      <ImagePicker onPick={imageField.onChange} ref={filePickerRef} />

      {!imageField.value ? (
        <button
          type="button"
          onClick={() => filePickerRef.current?.click()}
          className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-sm border"
        >
          <div>Select an image</div>
        </button>
      ) : (
        <div className="relative">
          <img src={imageField.value} className="w-full" />
          <button
            type="button"
            onClick={() => filePickerRef.current?.click()}
            className="absolute right-2 bottom-2 left-2 cursor-pointer rounded-sm bg-black/40 p-1 text-white"
          >
            Change image
          </button>
        </div>
      )}

      <div className="flex flex-col">
        <TextArea
          placeholder="description"
          errorMessage={
            errors.description && 'description or image is required'
          }
          formRegister={register('description', {
            validate: (value, formState) => !!(value || formState.image),
          })}
        />
      </div>

      <Submit disabled={isSubmitting} label="Create" />
    </form>
  );
};
