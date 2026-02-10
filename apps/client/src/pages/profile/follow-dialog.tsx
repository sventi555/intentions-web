import React, { useState } from 'react';
import { Link } from 'wouter';

import { performMutation } from '@/actions';
import { authErrorMessage } from '@/actions/errors';
import { Button } from '@/components/atoms/button';
import { Dialog } from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { Close, Search } from '@/components/icons';
import {
  useFollowedUsers,
  useFollowers,
  useInvalidateFollowedUsers,
  useInvalidateFollowers,
} from '@/hooks/follows';
import { useRemoveFollow } from '@/intentions-api';
import { useAuthState } from '@/state/auth';

interface FollowDialogProps {
  open: boolean;
  onClose: () => void;
  kind: 'following' | 'followers';
  users: { id: string; data: { username: string } }[] | undefined;
  onRemove: () => Promise<void>;
}

const FollowDialog: React.FC<FollowDialogProps> = ({
  open,
  onClose,
  kind,
  users,
  onRemove,
}) => {
  const { token } = useAuthState();
  const { mutateAsync: removeFollow } = useRemoveFollow();
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const [searchedUsername, setSearchedUsername] = useState('');

  const filteredFollowUsers = users?.filter((follower) =>
    follower.data.username
      .toLowerCase()
      .includes(searchedUsername.toLowerCase()),
  );

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="border-b border-neutral-300 p-2 text-center font-medium">
        {kind === 'following' ? 'Following' : 'Followers'}
      </div>
      <div className="p-2 shadow-sm">
        <Input
          placeholder="username"
          value={searchedUsername}
          closeOnEnter
          onChange={setSearchedUsername}
          Icon={searchedUsername ? Close : Search}
          onClickIcon={
            searchedUsername ? () => setSearchedUsername('') : undefined
          }
        />
      </div>
      {filteredFollowUsers ? (
        <div className="flex flex-col gap-2 overflow-y-scroll p-2 px-8">
          {filteredFollowUsers.map((user, index) => (
            <React.Fragment key={user.id}>
              <div className="flex items-center gap-4">
                <Link
                  className="grow"
                  href={`~/profile/${user.id}`}
                  onClick={onClose}
                >
                  {user.data.username}
                </Link>
                <Button
                  loading={removingUserId === user.id}
                  type="secondary"
                  onClick={() => {
                    performMutation({
                      mutate: () =>
                        removeFollow({
                          headers: { authorization: token ?? '' },
                          userId: user.id,
                          data: {
                            direction: kind === 'following' ? 'to' : 'from',
                          },
                        }),
                      setLoading: (loading) =>
                        setRemovingUserId(loading ? user.id : null),
                      errorMessages: {
                        400: 'Could not remove follow.',
                        401: authErrorMessage,
                      },
                      onSuccess: onRemove,
                    });
                  }}
                >
                  {kind === 'following' ? 'Unfollow' : 'Remove'}
                </Button>
              </div>

              {index !== filteredFollowUsers.length - 1 ? (
                <div className="min-h-px w-full bg-neutral-300" />
              ) : null}
            </React.Fragment>
          ))}
        </div>
      ) : null}
    </Dialog>
  );
};

export const FollowingDialog: React.FC<
  Pick<FollowDialogProps, 'open' | 'onClose'>
> = ({ open, onClose }) => {
  const { followedUsers } = useFollowedUsers();
  const invalidateFollowedUsers = useInvalidateFollowedUsers();

  return (
    <FollowDialog
      open={open}
      users={followedUsers}
      kind="following"
      onClose={onClose}
      onRemove={invalidateFollowedUsers}
    />
  );
};

export const FollowersDialog: React.FC<
  Pick<FollowDialogProps, 'open' | 'onClose'>
> = ({ open, onClose }) => {
  const { followers } = useFollowers();
  const invalidateFollowers = useInvalidateFollowers();

  return (
    <FollowDialog
      open={open}
      users={followers}
      kind="followers"
      onClose={onClose}
      onRemove={invalidateFollowers}
    />
  );
};
