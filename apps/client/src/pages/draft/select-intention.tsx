import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { StickyHeader } from '@/components/sticky-header';
import { useIntentions } from '@/hooks/intentions';
import { useAuthState } from '@/state/auth';

export const SelectIntention: React.FC = () => {
  const { authUser } = useAuthState();
  if (authUser == null) {
    throw new Error('Must be signed in to create post');
  }

  const { intentions } = useIntentions(authUser.uid);

  return (
    <div>
      <StickyHeader>
        <div className="text-center">Create post</div>
      </StickyHeader>
      <div className="sticky top-[97px] flex flex-col gap-2 bg-white p-2 pb-4">
        <div className="flex items-center justify-between">
          <div className="font-medium">Select intention</div>
          <Button type="primary">+ New intention</Button>
        </div>
        <Input placeholder="Search..." />
      </div>
      <div className="flex flex-col gap-3 p-2 px-8">
        {(intentions
          ? [
              ...intentions,
              ...intentions,
              ...intentions,
              ...intentions,
              ...intentions,
              ...intentions,
              ...intentions,
              ...intentions,
              ...intentions,
              ...intentions,
              ...intentions,
              ...intentions,
              ...intentions,
              ...intentions,
              ...intentions,
              ...intentions,
              ...intentions,
              ...intentions,
            ]
          : []
        ).map((intention) => (
          <button
            className="flex items-center justify-center rounded-2xl border border-[#2C3B4E] p-2"
            onClick={() => {}}
          >
            {intention.data.name}
          </button>
        ))}
      </div>
    </div>
  );
};
