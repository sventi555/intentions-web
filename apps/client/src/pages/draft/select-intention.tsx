import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { pageHeaderHeight } from '@/components/page-wrapper';
import { StickyHeader, stickyHeaderHeight } from '@/components/sticky-header';
import { useIntentions } from '@/hooks/intentions';
import { useAuthState } from '@/state/auth';
import { useDraftPostContext } from '@/state/draft';
import { CSSProperties, useEffect, useState } from 'react';
import { Redirect, useLocation } from 'wouter';

export const SelectIntention: React.FC = () => {
  const { authUser } = useAuthState();
  if (authUser == null) {
    throw new Error('Must be signed in to create post');
  }

  const [, navigate] = useLocation();
  const { intentions } = useIntentions(authUser.uid);

  const [searchVal, setSearchVal] = useState('');
  const [filteredIntentions, setFilteredIntentions] = useState(intentions);

  const { setIntention } = useDraftPostContext();

  useEffect(() => {
    if (searchVal === '') {
      setFilteredIntentions(intentions);
      return;
    }

    setFilteredIntentions(
      intentions?.filter((i) =>
        i.data.name.toLowerCase().includes(searchVal.toLowerCase()),
      ),
    );
  }, [searchVal, intentions]);

  if (intentions == null) {
    return null;
  }

  if (intentions.length === 0) {
    return <Redirect to="~/draft/create-intention" />;
  }

  return (
    <div>
      <StickyHeader>
        <div className="text-center">Select intention</div>
      </StickyHeader>
      <div
        style={
          {
            '--header-heights': `calc(${pageHeaderHeight} + ${stickyHeaderHeight})`,
          } as CSSProperties
        }
        className="flex h-[calc(100dvh-var(--header-heights))] flex-col gap-4 p-4"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">Select intention</div>
            <Button
              type="primary"
              onClick={() => navigate('~/draft/create-intention')}
            >
              + New intention
            </Button>
          </div>
          <Input
            placeholder="Search..."
            onChange={setSearchVal}
            value={searchVal}
          />
        </div>
        <div className="flex grow flex-col gap-3 overflow-y-auto px-4">
          {filteredIntentions?.map((intention) => (
            <button
              key={intention.id}
              className="flex cursor-pointer items-center justify-center rounded-2xl border border-[#2C3B4E] p-2 shadow"
              onClick={() => {
                setIntention({ id: intention.id, name: intention.data.name });
                navigate('~/draft/select-image');
              }}
            >
              {intention.data.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
