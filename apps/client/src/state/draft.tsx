import { performMutation } from '@/actions';
import { authErrorMessage } from '@/actions/errors';
import { useInvalidateIntentions } from '@/hooks/intentions';
import {
  useInvalidateFeedPosts,
  useInvalidateIntentionPosts,
  useInvalidateUserPosts,
} from '@/hooks/posts';
import { useCreatePost } from '@/intentions-api.gen';
import { Route as feedRoute } from '@/routes/_app/_feed';
import { useNavigate } from '@tanstack/react-router';
import { createContext, PropsWithChildren, useContext, useState } from 'react';
import {
  FieldErrors,
  SubmitHandler,
  useController,
  useForm,
  UseFormRegisterReturn,
} from 'react-hook-form';
import { useSignedInAuthState } from './auth';

type PostInputs = {
  intentionId: string;
  image: string;
  description: string;
};

type DraftStage = 'intention-select' | 'intention-create' | 'image' | 'review';

interface DraftPostState {
  stage: DraftStage;
  setStage: (stage: DraftStage) => void;
  intentionId: string;
  setIntentionId: (intentionId: string) => void;
  base64Img: string;
  setBase64Img: (img: string) => void;
  registerDescription: UseFormRegisterReturn;
  onSubmit: () => void;
  formErrors: FieldErrors<PostInputs>;
  isSubmitting: boolean;
}

const DraftPostContext = createContext<DraftPostState | null>(null);

export const DraftPostProvider: React.FC<PropsWithChildren> = (props) => {
  const { authUser } = useSignedInAuthState();
  const [stage, setStage] = useState<DraftStage>('intention-select');
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PostInputs>();
  const { field: intentionId } = useController<PostInputs>({
    name: 'intentionId',
    control,
    rules: { required: true },
  });
  const { field: image } = useController<PostInputs>({
    name: 'image',
    control,
    rules: { deps: ['description'] },
  });

  const { mutateAsync: createPost } = useCreatePost();
  const navigate = useNavigate();
  const invalidateFeedPosts = useInvalidateFeedPosts();
  const invalidateUserPosts = useInvalidateUserPosts();
  const invalidateIntentionPosts = useInvalidateIntentionPosts();
  const invalidateIntentions = useInvalidateIntentions();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit: SubmitHandler<PostInputs> = (data) => {
    performMutation({
      mutate: () =>
        authUser.getIdToken().then((token) =>
          createPost({
            headers: { authorization: token ?? '' },
            data: {
              intentionId: intentionId.value,
              description: data.description,
              ...(image.value ? { image: image.value } : {}),
            },
          }),
        ),
      setLoading: setIsSubmitting,
      errorMessages: {
        401: authErrorMessage,
        404: 'Could not create post - intention does not exist.',
      },
      onSuccess: () => {
        invalidateUserPosts(authUser.uid);
        invalidateIntentionPosts(authUser.uid, intentionId.value);
        invalidateIntentions(authUser.uid);

        return invalidateFeedPosts(authUser.uid).then(() =>
          navigate({ to: feedRoute.to }),
        );
      },
    });
  };

  return (
    <DraftPostContext.Provider
      value={{
        stage,
        setStage,
        intentionId: intentionId.value,
        setIntentionId: intentionId.onChange,
        base64Img: image.value,
        setBase64Img: image.onChange,
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
