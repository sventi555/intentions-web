import { SubmitHandler, useForm } from 'react-hook-form';
import { useLocation } from 'wouter';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Submit } from '../components/submit';
import {
  useCreateIntention,
  useInvalidateIntentions,
} from '../hooks/intentions';
import { useAuthState } from '../state/auth';

type Inputs = {
  intention: string;
};

export const CreateIntention: React.FC = () => {
  const [, setLocation] = useLocation();

  const authUser = useAuthState().authUser;
  const createIntention = useCreateIntention();
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
    createIntention({ body: { name: data.intention } })
      .then(() => invalidateIntentions(authUser.uid))
      .then(() => setLocation('/create'));

  return (
    <div className="flex grow flex-col items-center justify-center gap-4">
      <div className="text-lg">Create an intention</div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex min-w-64 flex-col gap-2"
      >
        <Input
          placeholder="eg. touch grass"
          centered={true}
          errorMessage={errors.intention && 'intention is required'}
          formRegister={register('intention', { required: true })}
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
