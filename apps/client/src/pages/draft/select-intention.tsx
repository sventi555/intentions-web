import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { pageHeaderHeight } from '@/components/page-wrapper';
import { StickyHeader, stickyHeaderHeight } from '@/components/sticky-header';
import { useIntentions } from '@/hooks/intentions';
import { useAuthState } from '@/state/auth';
import { CSSProperties, useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export const SelectIntention: React.FC = () => {
  const { authUser } = useAuthState();
  if (authUser == null) {
    throw new Error('Must be signed in to create post');
  }

  const [, navigate] = useLocation();
  const { intentions } = useIntentions(authUser.uid);

  const [searchVal, setSearchVal] = useState('');
  const [filteredIntentions, setFilteredIntentions] = useState(intentions);

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

  return (
    <div>
      <StickyHeader>
        <div className="text-center">Create post</div>
      </StickyHeader>
      <div
        style={
          {
            '--header-heights': `calc(${pageHeaderHeight} + ${stickyHeaderHeight})`,
          } as CSSProperties
        }
        className="flex h-[calc(100dvh-var(--header-heights))] flex-col"
      >
        <div className="flex flex-col gap-2 p-2">
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
        <div className="flex grow flex-col gap-3 overflow-y-auto p-2 px-8">
          {filteredIntentions?.map((intention) => (
            <button
              className="flex items-center justify-center rounded-2xl border border-[#2C3B4E] p-2"
              onClick={() => {}}
            >
              {intention.data.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
