import { clsx } from 'clsx';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useLocation } from 'wouter';

import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Submit } from '@/components/atoms/submit';
import { useInvalidateIntentions } from '@/hooks/intentions';
import { useCreateIntention } from '@/intentions-api';
import { useAuthState } from '@/state/auth';

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  if (authUser == null) {
    throw new Error('must be signed in to create intention');
  }

  const onSubmit: SubmitHandler<Inputs> = (data) =>
    createIntention({
      headers: { authorization: token ?? '' },
      data: { name: data.intention },
    })
      .then(() => invalidateIntentions(authUser.uid))
      .then(() => setLocation('/create'));

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
            <Submit disabled={isSubmitting} label="Create" />
          </div>
        </div>
      </form>
    </div>
  );
};
