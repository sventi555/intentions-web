import { clsx } from 'clsx';
import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '../components/button';
import { DisplayPic } from '../components/display-pic';
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

  const { user: searchedUser } = useSearchUser(searchedUsername);

  const { follow: searchedUserFollow } = useFollow(searchedUser?.id);
  const searchedUserAccepted =
    searchedUserFollow != null && searchedUserFollow.status === 'accepted';
  const followUser = useFollowUser();
  const removeFollow = useRemoveFollow();
  const invalidateFollow = useInvalidateFollow();

  return (
    <div className="flex grow flex-col p-2">
      <div className="flex items-center gap-1">
        <input
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="grow rounded-sm border p-1"
        />
        <div className="flex basis-24 flex-col">
          <Button
            type="secondary"
            onClick={() => setSearchedUsername(username)}
          >
            Search
          </Button>
        </div>
      </div>

      {searchedUsername && !searchedUser ? (
        <div className="text-neutral-600">user not found</div>
      ) : null}

      {searchedUser != null ? (
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
                  type="primary"
                  onClick={() =>
                    followUser({ userId: searchedUser.id }).then(() =>
                      invalidateFollow(searchedUser.id),
                    )
                  }
                >
                  Follow
                </Button>
              ) : null}
              {searchedUserFollow != null &&
              searchedUserFollow.status === 'pending' ? (
                <Button
                  type="secondary"
                  onClick={() =>
                    removeFollow({
                      userId: searchedUser.id,
                      body: { direction: 'to' },
                    }).then(() => invalidateFollow(searchedUser.id))
                  }
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
