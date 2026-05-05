import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { auth } from '@/firebase';
import { Route as forgotPasswordRoute } from '@/routes/_auth/forgot-password';
import { Route as signUpRoute } from '@/routes/_auth/sign-up';
import { createFileRoute, Link } from '@tanstack/react-router';
import { AuthError, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

type Inputs = {
  email: string;
  password: string;
};

const SignIn: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    return signInWithEmailAndPassword(auth, data.email, data.password)
      .catch((e: AuthError) => {
        const invalidCredsErrors = [
          'auth/invalid-credential',
          'auth/invalid-email',
          'auth/wrong-password',
        ];
        toast.error(
          invalidCredsErrors.includes(e.code)
            ? 'Invalid credentials - check email and password.'
            : 'Something went wrong - please try again.',
        );
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="flex grow flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center">
        <div className="text-3xl">Why?</div>
        <div>this is why</div>
      </div>
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
        <Input
          type="password"
          onEnter={handleSubmit(onSubmit)}
          placeholder="password"
          formRegister={register('password', { required: true })}
          errorMessage={errors.password && 'password is required'}
        />
        <Button type="submit" loading={isSubmitting}>
          Sign in
        </Button>
        <Link to={forgotPasswordRoute.to} className="underline">
          Forgot password
        </Link>
      </form>
      <div>
        New user?{' '}
        <Link to={signUpRoute.to} className="underline">
          Sign up
        </Link>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_auth/sign-in')({ component: SignIn });
