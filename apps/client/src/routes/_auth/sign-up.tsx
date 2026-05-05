import { performMutation } from '@/actions';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { auth } from '@/firebase';
import { useCreateUser } from '@/intentions-api.gen';
import { Route as signInRoute } from '@/routes/_auth/sign-in';
import { createFileRoute, Link } from '@tanstack/react-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

type Inputs = {
  username: string;
  email: string;
  password: string;
};

const SignUp: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const { mutateAsync: createUser } = useCreateUser();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    performMutation({
      mutate: () => createUser({ data }),
      setLoading: setIsSubmitting,
      errorMessages: {
        400: 'Invalid email or password.',
        409: 'Email or username is already taken.',
      },
      onSuccess: () =>
        signInWithEmailAndPassword(auth, data.email, data.password),
    });
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
          placeholder="username"
          formRegister={register('username', { required: true })}
          errorMessage={errors.username && 'username is required'}
        />
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
        <Button loading={isSubmitting} type="submit">
          Sign up
        </Button>
      </form>
      <div>
        Already a user?{' '}
        <Link to={signInRoute.to} className="underline">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_auth/sign-up')({ component: SignUp });
