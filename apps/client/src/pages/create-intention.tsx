import { useState } from 'react';
import { useLocation } from 'wouter';
import { useCreateIntention } from '../hooks/intentions';

export const CreateIntention: React.FC = () => {
  const [intention, setIntention] = useState('');
  const [, setLocation] = useLocation();

  const createIntention = useCreateIntention();

  return (
    <div className="flex flex-col gap-1 p-1">
      <input
        placeholder="eg. touch grass"
        onChange={(e) => setIntention(e.target.value)}
        className="rounded-sm border p-1 text-center"
      />
      <button
        onClick={() =>
          createIntention({ body: { name: intention } }).then(() =>
            setLocation('/create'),
          )
        }
        className="rounded-sm bg-blue-200 p-1"
      >
        Create intention
      </button>
    </div>
  );
};
