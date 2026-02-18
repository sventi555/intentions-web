import { clsx } from 'clsx';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useLocation } from 'wouter';

import { performMutation } from '@/actions';
import { authErrorMessage } from '@/actions/errors';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { useInvalidateIntentions } from '@/hooks/intentions';
import { useCreateIntention } from '@/intentions-api';
import { useAuthState } from '@/state/auth';
import { useDraftPostContext } from '@/state/draft';

const suggestions = [
  'be more adventurous',
  'learn new things',
  'eat healthy food',
  'spend time with friends',
  'make my own clothes',
  'pet lots of dogs',
];

type Inputs = {
  intention: string;
};

export const CreateIntention: React.FC = () => {
  const [, setLocation] = useLocation();

  const { authUser, token } = useAuthState();
  const { mutateAsync: createIntention } = useCreateIntention();
  const invalidateIntentions = useInvalidateIntentions();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setIntention } = useDraftPostContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  if (authUser == null) {
    throw new Error('must be signed in to create intention');
  }

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    performMutation({
      mutate: () =>
        createIntention({
          headers: { authorization: token ?? '' },
          data: { name: data.intention },
        }),
      setLoading: setIsSubmitting,
      errorMessages: {
        401: authErrorMessage,
        409: 'An intention with the same name already exists.',
      },
      onSuccess: (res) =>
        invalidateIntentions(authUser.uid).then(() => {
          setIntention({ id: res.data.id, name: data.intention });

          // make sure intention id is set before next step to avoid redirect
          requestAnimationFrame(() => setLocation('~/draft/select-image'));
        }),
    });
  };

  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestionChanging, setSuggestionChanging] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  useEffect(() => {
    if (!showSuggestions) {
      return;
    }

    const rotateSuggestion = setInterval(() => {
      setSuggestionChanging(true);
      setTimeout(() => {
        setSuggestionIndex((prevIndex) => (prevIndex + 1) % suggestions.length);
        setSuggestionChanging(false);
      }, 300);
    }, 2500);

    return () => clearInterval(rotateSuggestion);
  }, [showSuggestions]);

  return (
    <div className="flex grow flex-col items-center justify-center gap-4">
      <div className="text-lg">Create an intention</div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex min-w-64 flex-col gap-2"
      >
        <Input
          placeholder={`${suggestions[suggestionIndex]}`}
          onFocus={() => setShowSuggestions(false)}
          maxLength={32}
          errorMessage={errors.intention && 'intention is required'}
          onEnter={handleSubmit(onSubmit)}
          className={clsx(
            'text-center placeholder:transition-colors placeholder:duration-300 focus:placeholder:text-transparent',
            (suggestionChanging || !showSuggestions) &&
              'placeholder:text-transparent',
          )}
          formRegister={register('intention', {
            required: true,
            onBlur: () => setShowSuggestions(true),
          })}
        />
        <div className="flex gap-2">
          <div className="flex grow flex-col">
            <Button type="secondary" onClick={() => history.back()}>
              Cancel
            </Button>
          </div>
          <div className="flex grow flex-col">
            <Button type="submit" loading={isSubmitting}>
              Create
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
