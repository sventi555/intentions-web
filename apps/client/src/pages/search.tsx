import { clsx } from 'clsx';
import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '../components/button';
import { DisplayPic } from '../components/display-pic';
import { Input } from '../components/input';
import {
  useFollow,
  useFollowUser,
  useInvalidateFollow,
  useRemoveFollow,
} from '../hooks/follows';
import { useSearchUser } from '../hooks/users';

export const Search: React.FC = () => {
  const [username, setUsername] = useState('');
  const [searchedUsername, setSearchedUsername] = useState('');

  const { user: searchedUser, isLoading: searchedUserLoading } =
    useSearchUser(searchedUsername);

  const { follow: searchedUserFollow, isLoading: searchedFollowLoading } =
    useFollow(searchedUser?.id);
  const searchedUserAccepted =
    searchedUserFollow != null && searchedUserFollow.status === 'accepted';
  const followUser = useFollowUser();
  const removeFollow = useRemoveFollow();
  const invalidateFollow = useInvalidateFollow();

  const [followPending, setFollowPending] = useState(false);

  return (
    <div className="flex grow flex-col p-2">
      <div className="flex items-center gap-1">
        <div className="flex grow flex-col">
          <Input
            placeholder="username"
            value={username}
            onEnter={() => setSearchedUsername(username)}
            closeOnEnter
            onChange={setUsername}
          />
        </div>
        <div className="flex basis-24 flex-col">
          <Button
            type="secondary"
            onClick={() => setSearchedUsername(username)}
          >
            Search
          </Button>
        </div>
      </div>

      {searchedUsername && !searchedUserLoading && !searchedUser ? (
        <div className="text-neutral-600">user not found</div>
      ) : null}

      {searchedUser != null && !searchedFollowLoading ? (
        <div className="flex grow flex-col items-center justify-center">
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
                    followUser({ userId: searchedUser.id }).then(() => {
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
                      userId: searchedUser.id,
                      body: { direction: 'to' },
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
        </div>
      ) : null}
    </div>
  );
};
