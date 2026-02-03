import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link, Redirect } from 'wouter';

import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { InputError } from '@/components/atoms/input-error';
import { auth } from '@/firebase';
import { useAuthState } from '@/state/auth';

type Inputs = {
  email: string;
};

export const ForgotPassword: React.FC = () => {
  const { authUser } = useAuthState();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setError('');

    return sendPasswordResetEmail(auth, data.email)
      .then(() => {
        setSent(true);
      })
      .catch(() => {
        setError('failed to send - please try again');
      });
  };

  if (authUser) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex grow flex-col items-center justify-center gap-4">
      <div className="text-lg">Reset password</div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex min-w-64 flex-col gap-1"
      >
        <Input
          type="email"
          placeholder="email"
          formRegister={register('email', { required: true })}
          errorMessage={errors.email && 'email is required'}
        />
        <Button type="submit" loading={isSubmitting}>
          Send reset
        </Button>
        {sent && (
          <div className="text-sm">Sent! Check email for reset link</div>
        )}
        {error && <InputError>{error}</InputError>}
      </form>
      <Link href="/sign-in" className="underline">
        Sign in
      </Link>
    </div>
  );
};
