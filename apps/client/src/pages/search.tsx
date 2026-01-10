import { clsx } from 'clsx';
import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '../components/atoms/button';
import { Input } from '../components/atoms/input';
import { DisplayPic } from '../components/display-pic';
import { Close, Search as SearchIcon } from '../components/icons';
import { useFollow, useInvalidateFollow } from '../hooks/follows';
import { useSearchUser } from '../hooks/users';
import { useFollowUser, useRemoveFollow } from '../intentions-api';
import { useAuthState } from '../state/auth';

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
            href={searchedUserAccepted ? `/profile/${searchedUser.id}` : ''}
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
                  disabled={followPending}
                  type="primary"
                  onClick={() => {
                    setFollowPending(true);
                    followUser({
                      headers: { authorization: token ?? '' },
                      userId: searchedUser.id,
                    }).then(() => {
                      setFollowPending(false);
                      invalidateFollow(searchedUser.id);
                    });
                  }}
                >
                  Follow
                </Button>
              ) : null}
              {searchedUserFollow != null &&
              searchedUserFollow.status === 'pending' ? (
                <Button
                  disabled={followPending}
                  type="secondary"
                  onClick={() => {
                    setFollowPending(true);
                    removeFollow({
                      headers: { authorization: token ?? '' },
                      userId: searchedUser.id,
                      data: { direction: 'to' },
                    }).then(() => {
                      setFollowPending(false);
                      invalidateFollow(searchedUser.id);
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
