import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '../components/button';
import {
  useCreateIntention,
  useInvalidateIntentions,
} from '../hooks/intentions';
import { useAuthState } from '../state/auth';

export const CreateIntention: React.FC = () => {
  const [intention, setIntention] = useState('');
  const [, setLocation] = useLocation();

  const authUser = useAuthState().authUser;
  const createIntention = useCreateIntention();
  const invalidateIntentions = useInvalidateIntentions();

  if (authUser == null) {
    throw new Error('must be signed in to create intention');
  }

  return (
    <div className="flex grow flex-col justify-center gap-4 p-4">
      <input
        placeholder="eg. touch grass"
        onChange={(e) => setIntention(e.target.value)}
        className="rounded-sm border p-1 text-center"
      />
      <Button
        disabled={!intention}
        type="primary"
        onClick={() =>
          createIntention({ body: { name: intention } })
            .then(() => invalidateIntentions(authUser.uid))
            .then(() => setLocation('/create'))
        }
      >
        Create intention
      </Button>
    </div>
  );
};
