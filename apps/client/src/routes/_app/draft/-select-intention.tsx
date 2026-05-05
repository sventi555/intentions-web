import { Input } from '@/components/atoms/input';
import { Search } from '@/components/icons';
import { PageHeader } from '@/components/page-header';
import { useIntentions } from '@/hooks/intentions';
import { useSignedInAuthState } from '@/state/auth';
import { useDraftPostContext } from '@/state/draft';
import { useState } from 'react';

export const SelectIntention: React.FC = () => {
  const { authUser } = useSignedInAuthState();
  const { intentions } = useIntentions(authUser.uid);
  const { setIntentionId, setStage } = useDraftPostContext();
  const [searchVal, setSearchVal] = useState('');

  const filteredIntentions = intentions?.filter((intention) =>
    intention.data.name.toLowerCase().includes(searchVal.toLowerCase()),
  );

  return (
    <div className="flex h-[calc(100dvh-56px)] flex-col">
      <PageHeader
        title="Create a post"
        subtitle="Select an intention"
        sticky={false}
      />

      <div className="flex flex-col gap-4 overflow-hidden p-4">
        <Input
          value={searchVal}
          placeholder="search your intentions"
          onChange={setSearchVal}
          Icon={Search}
        />

        <div className="flex flex-col gap-2 overflow-y-scroll">
          <button
            onClick={() => {
              setStage('intention-create');
            }}
            className="cursor-pointer rounded-2xl border bg-[#2C3B4E] p-1 text-white"
          >
            + New Intention
          </button>
          {filteredIntentions?.map((intention) => (
            <button
              key={intention.id}
              onClick={() => {
                setIntentionId(intention.id);
                setStage('image');
              }}
              className="cursor-pointer rounded-full border p-1"
            >
              {intention.data.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
