import { performMutation } from '@/actions';
import { authErrorMessage } from '@/actions/errors';
import { useInvalidateIntentions } from '@/hooks/intentions';
import {
  useInvalidateFeedPosts,
  useInvalidateIntentionPosts,
  useInvalidateUserPosts,
} from '@/hooks/posts';
import { useCreatePost } from '@/intentions-api';
import { createContext, PropsWithChildren, useContext, useState } from 'react';
import {
  FieldErrors,
  SubmitHandler,
  useController,
  useForm,
  UseFormRegisterReturn,
} from 'react-hook-form';
import { useLocation } from 'wouter';
import { useAuthState } from './auth';

type PostInputs = {
  image: string;
  description: string;
};

interface DraftPostState {
  intention: { id: string; name: string } | null;
  setIntention: (intention: { id: string; name: string } | null) => void;
  base64Img: string;
  setBase64Img: (img: string) => void;
  registerDescription: UseFormRegisterReturn;
  onSubmit: () => void;
  formErrors: FieldErrors<PostInputs>;
  isSubmitting: boolean;
}

const DraftPostContext = createContext<DraftPostState | null>(null);

export const DraftPostProvider: React.FC<PropsWithChildren> = (props) => {
  const { authUser, token } = useAuthState();

  if (authUser == null) {
    throw new Error('Must be logged in to use draft post provider');
  }

  const [intention, setIntention] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PostInputs>();
  const { field: imageField } = useController<PostInputs>({
    name: 'image',
    control,
    rules: { deps: ['description'] },
  });

  const { mutateAsync: createPost } = useCreatePost();
  const [, setLocation] = useLocation();
  const invalidateFeedPosts = useInvalidateFeedPosts();
  const invalidateUserPosts = useInvalidateUserPosts();
  const invalidateIntentionPosts = useInvalidateIntentionPosts();
  const invalidateIntentions = useInvalidateIntentions();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit: SubmitHandler<PostInputs> = (data) => {
    if (!intention) {
      throw new Error('Cannot create post without intention');
    }

    performMutation({
      mutate: () =>
        createPost({
          headers: { authorization: token ?? '' },
          data: {
            intentionId: intention.id,
            description: data.description,
            ...(imageField.value ? { image: imageField.value } : {}),
          },
        }),
      setLoading: setIsSubmitting,
      errorMessages: {
        401: authErrorMessage,
        404: 'Could not create post - intention does not exist.',
      },
      onSuccess: () =>
        Promise.all([
          invalidateUserPosts(authUser.uid),
          invalidateFeedPosts(authUser.uid),
          invalidateIntentionPosts(authUser.uid, intention.id),
          invalidateIntentions(authUser.uid),
        ]).then(() => setLocation('~/')),
    });
  };

  return (
    <DraftPostContext.Provider
      value={{
        intention,
        setIntention,
        base64Img: imageField.value,
        setBase64Img: imageField.onChange,
        registerDescription: register('description', {
          validate: (value, formState) => !!(value || formState.image),
        }),
        onSubmit: handleSubmit(onSubmit),
        formErrors: errors,
        isSubmitting,
      }}
    >
      {props.children}
    </DraftPostContext.Provider>
  );
};

export const useDraftPostContext = () => {
  const createPostState = useContext(DraftPostContext);

  if (createPostState == null) {
    throw new Error('No create post provider');
  }

  return createPostState;
};
