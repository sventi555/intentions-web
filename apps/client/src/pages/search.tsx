import { clsx } from 'clsx';
import { useState } from 'react';
import { Link } from 'wouter';

import { performMutation } from '@/actions';
import { authErrorMessage } from '@/actions/errors';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { DisplayPic } from '@/components/display-pic';
import { Close, Search as SearchIcon } from '@/components/icons';
import { useFollow, useInvalidateFollow } from '@/hooks/follows';
import { useSearchUser } from '@/hooks/users';
import { useFollowUser, useRemoveFollow } from '@/intentions-api';
import { useAuthState } from '@/state/auth';

export const Search: React.FC = () => {
  const { token } = useAuthState();

  const [username, setUsername] = useState('');
  const [searchedUsername, setSearchedUsername] = useState('');

  const { user: searchedUser, isLoading: searchedUserLoading } =
    useSearchUser(searchedUsername);

  const { follow: searchedUserFollow, isLoading: searchedFollowLoading } =
    useFollow(searchedUser?.id);
  const searchedUserAccepted =
    searchedUserFollow != null && searchedUserFollow.status === 'accepted';
  const { mutateAsync: followUser } = useFollowUser();
  const { mutateAsync: removeFollow } = useRemoveFollow();
  const invalidateFollow = useInvalidateFollow();

  const [followPending, setFollowPending] = useState(false);

  return (
    <div className="flex grow flex-col items-center gap-2 p-4">
      <div className="text-neutral-600">
        Enter an <b>exact</b> username to follow someone
      </div>

      <div className="flex items-center gap-1 self-stretch">
        <div className="flex grow flex-col">
          <Input
            placeholder="username"
            value={username}
            onEnter={() => setSearchedUsername(username)}
            closeOnEnter
            onChange={setUsername}
            Icon={username ? Close : SearchIcon}
            onClickIcon={username ? () => setUsername('') : undefined}
          />
        </div>
        <div className="flex basis-[80px] flex-col">
          <Button
            type="secondary"
            onClick={() => setSearchedUsername(username)}
          >
            Search
          </Button>
        </div>
      </div>

      <div className="flex grow flex-col items-center justify-center">
        {searchedUser != null && !searchedFollowLoading ? (
          <Link
            href={searchedUserAccepted ? `~/profile/${searchedUser.id}` : ''}
            className={clsx(
              'flex flex-col items-center gap-1 rounded-2xl p-4',
              searchedUserAccepted ? 'border' : 'cursor-default',
            )}
          >
            <DisplayPic imageUri={searchedUser.data.image} size={128} />
            <div>{searchedUser.data.username}</div>
            <div className="flex flex-col self-stretch">
              {searchedUserFollow == null ? (
                <Button
                  loading={followPending}
                  type="primary"
                  onClick={() => {
                    performMutation({
                      mutate: () =>
                        followUser({
                          headers: { authorization: token ?? '' },
                          userId: searchedUser.id,
                        }),
                      setLoading: setFollowPending,
                      errorMessages: {
                        401: authErrorMessage,
                        404: 'Could not follow user - profile does not exist.',
                      },
                      onSuccess: () => invalidateFollow(searchedUser.id),
                    });
                  }}
                >
                  Follow
                </Button>
              ) : null}
              {searchedUserFollow != null &&
              searchedUserFollow.status === 'pending' ? (
                <Button
                  loading={followPending}
                  type="secondary"
                  onClick={() => {
                    performMutation({
                      mutate: () =>
                        removeFollow({
                          headers: { authorization: token ?? '' },
                          userId: searchedUser.id,
                          data: { direction: 'to' },
                        }),
                      setLoading: setFollowPending,
                      errorMessages: {
                        400: 'Could not remove follow request.',
                        401: authErrorMessage,
                      },
                      onSuccess: () => invalidateFollow(searchedUser.id),
                    });
                  }}
                >
                  Pending
                </Button>
              ) : null}
            </div>
          </Link>
        ) : null}

        {searchedUsername && !searchedUserLoading && !searchedUser ? (
          <div>user not found</div>
        ) : null}
      </div>
    </div>
  );
};
