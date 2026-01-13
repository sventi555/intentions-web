import { useRef, useState } from 'react';
import { SubmitHandler, useController, useForm } from 'react-hook-form';
import { Link, Redirect, useLocation } from 'wouter';

import { ImagePicker } from '@/components/atoms/image-picker';
import { Submit } from '@/components/atoms/submit';
import { TextArea } from '@/components/atoms/text-area';
import { Plus } from '@/components/icons';
import { StickyHeader } from '@/components/sticky-header';
import { useIntentions, useInvalidateIntentions } from '@/hooks/intentions';
import {
  useInvalidateFeedPosts,
  useInvalidateIntentionPosts,
  useInvalidateUserPosts,
} from '@/hooks/posts';
import { useCreatePost } from '@/intentions-api';
import { useAuthState } from '@/state/auth';

// no need to control intentionId since it's always set
type Inputs = {
  image: string;
  description: string;
};

export const CreatePost: React.FC = () => {
  const { authUser, token } = useAuthState();

  if (authUser == null) {
    throw new Error('Must be logged in to view create post page');
  }

  const { intentions } = useIntentions(authUser.uid);
  const [selectedIntentionId, setSelectedIntentionId] = useState<string | null>(
    null,
  );
  const filePickerRef = useRef<HTMLInputElement | null>(null);

  const { mutateAsync: createPost } = useCreatePost();
  const [, setLocation] = useLocation();
  const invalidateFeedPosts = useInvalidateFeedPosts();
  const invalidateUserPosts = useInvalidateUserPosts();
  const invalidateIntentionPosts = useInvalidateIntentionPosts();
  const invalidateIntentions = useInvalidateIntentions();

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
      headers: { authorization: token ?? '' },
      data: {
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
          invalidateIntentions(authUser.uid),
        ]),
      )
      .then(() => setLocation('/'));

  return (
    <div>
      <StickyHeader>
        <div className="text-lg">Create a post</div>
        <div className="text-sm">Show how you're acting with intention</div>
      </StickyHeader>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-2 p-2"
      >
        <div className="flex flex-col">
          <label>Pick an intention:</label>
          <div className="flex items-center gap-1">
            <select
              onChange={(e) => setSelectedIntentionId(e.target.value)}
              value={computedIntentionId}
              className="grow cursor-pointer rounded-sm border border-neutral-300 p-1"
            >
              {intentions.map(({ id, data }) => (
                <option value={id} key={id}>
                  {data.name}
                </option>
              ))}
            </select>
            <Link
              href="/create/intention"
              className="rounded-full border border-neutral-300 p-1"
            >
              <Plus className="size-[20px] text-neutral-800" />
            </Link>
          </div>
        </div>

        <ImagePicker onPick={imageField.onChange} ref={filePickerRef} />

        {!imageField.value ? (
          <button
            type="button"
            onClick={() => filePickerRef.current?.click()}
            className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-sm border border-neutral-300"
          >
            <div className="text-neutral-600">Select an image</div>
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
    </div>
  );
};
