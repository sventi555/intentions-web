import { useRef } from 'react';
import { Link, Redirect } from 'wouter';

import { Button } from '@/components/atoms/button';
import { ImagePicker } from '@/components/atoms/image-picker';
import { TextArea } from '@/components/atoms/text-area';
import { Plus } from '@/components/icons';
import { StickyHeader } from '@/components/sticky-header';
import { useIntentions } from '@/hooks/intentions';
import { useAuthState } from '@/state/auth';
import { useDraftPostContext } from '@/state/draft';

export const CreatePost: React.FC = () => {
  const {
    intentionId,
    setIntentionId,
    base64Img,
    setBase64Img,
    getOnSubmit,
    formErrors,
    registerDescription,
    isSubmitting,
  } = useDraftPostContext();

  const { authUser } = useAuthState();

  if (authUser == null) {
    throw new Error('Must be logged in to view create post page');
  }

  const { intentions } = useIntentions(authUser.uid);
  const filePickerRef = useRef<HTMLInputElement | null>(null);

  if (intentions == null) {
    return null;
  }

  if (intentions.length === 0) {
    return <Redirect to="~/create/intention" replace={true} />;
  }

  const computedIntentionId = intentionId || intentions[0].id;

  return (
    <div>
      <StickyHeader>
        <div className="text-lg">Create a post</div>
        <div className="text-sm">Show how you're acting with intention</div>
      </StickyHeader>

      <form
        onSubmit={getOnSubmit(computedIntentionId)}
        className="flex flex-col gap-2 p-2"
      >
        <div className="flex flex-col">
          <label>Pick an intention:</label>
          <div className="flex items-center gap-1">
            <select
              onChange={(e) => setIntentionId(e.target.value)}
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
              href="~/create/intention"
              className="rounded-full border border-neutral-300 p-1"
            >
              <Plus className="size-[20px] text-neutral-800" />
            </Link>
          </div>
        </div>

        <ImagePicker onPick={setBase64Img} ref={filePickerRef} />

        {!base64Img ? (
          <button
            type="button"
            onClick={() => filePickerRef.current?.click()}
            className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-sm border border-neutral-300"
          >
            <div className="text-neutral-600">Select an image</div>
          </button>
        ) : (
          <div className="relative">
            <img src={base64Img} className="w-full" />
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
              formErrors.description && 'description or image is required'
            }
            formRegister={registerDescription}
          />
        </div>

        <Button type="submit" loading={isSubmitting}>
          Create
        </Button>
      </form>
    </div>
  );
};
