import { signInWithEmailAndPassword } from 'firebase/auth';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link, Redirect } from 'wouter';
import { Input } from '../components/input';
import { Submit } from '../components/submit';
import { auth } from '../firebase';
import { useCreateUser } from '../hooks/users';
import { useAuthState } from '../state/auth';

type Inputs = {
  username: string;
  email: string;
  password: string;
};

export const SignUp: React.FC = () => {
  const { authUser } = useAuthState();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  const createUser = useCreateUser();

  const onSubmit: SubmitHandler<Inputs> = (data) =>
    createUser({ body: { ...data } }).then(() =>
      signInWithEmailAndPassword(auth, data.email, data.password),
    );

  if (authUser) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center">
        <div className="text-3xl">Intentions</div>
        <div>act intentionally</div>
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
          placeholder="email"
          formRegister={register('email', { required: true })}
          errorMessage={errors.email && 'email is required'}
        />
        <Input
          type="password"
          placeholder="password"
          formRegister={register('password', { required: true })}
          errorMessage={errors.password && 'password is required'}
        />
        <Submit disabled={isSubmitting} label="Sign up" />
      </form>
      <div>
        Already a user?{' '}
        <Link href="/sign-in" className="underline">
          Sign in
        </Link>
      </div>
    </div>
  );
};
