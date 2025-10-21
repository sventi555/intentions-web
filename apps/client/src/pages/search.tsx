import { clsx } from 'clsx';
import { useState } from 'react';
import { Link } from 'wouter';
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
    <div className="flex grow flex-col gap-1 p-1">
      <div className="flex gap-1">
        <input
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="grow rounded-sm border p-1"
        />
        <button
          onClick={() => setSearchedUsername(username)}
          className="basis-24 self-start rounded-sm bg-neutral-200 p-1"
        >
          Search
        </button>
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
              searchedUserAccepted ? 'border' : null,
            )}
          >
            <DisplayPic imageUri={searchedUser.data.image} size={128} />
            <div>{searchedUser.data.username}</div>
            {/* once users follow self, this will disappear for self search, which is good */}
            {searchedUserFollow == null ? (
              <button
                onClick={() =>
                  followUser({ userId: searchedUser.id }).then(() =>
                    invalidateFollow(searchedUser.id),
                  )
                }
                className="min-w-24 rounded-sm bg-blue-200 p-1"
              >
                Follow
              </button>
            ) : null}
            {searchedUserFollow != null &&
            searchedUserFollow.status === 'pending' ? (
              <button
                onClick={() =>
                  removeFollow({
                    userId: searchedUser.id,
                    body: { direction: 'to' },
                  }).then(() => invalidateFollow(searchedUser.id))
                }
                className="min-w-24 rounded-sm bg-neutral-200 p-1"
              >
                Pending
              </button>
            ) : null}
          </Link>
        </div>
      ) : null}
    </div>
  );
};
