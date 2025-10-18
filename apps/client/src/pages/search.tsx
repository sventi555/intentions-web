import { useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { useState } from 'react';
import { Link } from 'wouter';
import { useDownloadUrl } from '../hooks/download-url';
import { useFollow, useFollowUser } from '../hooks/follows';
import { useSearchUser } from '../hooks/users';

export const Search: React.FC = () => {
  const [username, setUsername] = useState('');
  const [searchedUsername, setSearchedUsername] = useState('');

  const { user: searchedUser } = useSearchUser(searchedUsername);
  const { downloadUrl: dpUrl } = useDownloadUrl(searchedUser?.data.image);

  const { follow: searchedUserFollow } = useFollow(searchedUser?.id);
  const searchedUserAccepted =
    searchedUserFollow != null && searchedUserFollow.data.status === 'accepted';
  const followUser = useFollowUser();

  const queryClient = useQueryClient();

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
            <img className="size-32 rounded-full border" src={dpUrl} />
            <div>{searchedUser.data.username}</div>
            {searchedUserFollow == null ? (
              <button
                onClick={() =>
                  followUser({ userId: searchedUser.id }).then(() =>
                    queryClient.invalidateQueries({
                      queryKey: ['follow', { toUserId: searchedUser.id }],
                    }),
                  )
                }
                className="min-w-24 rounded-sm bg-blue-200 p-1"
              >
                Follow
              </button>
            ) : null}
            {searchedUserFollow != null &&
            searchedUserFollow.data.status === 'pending' ? (
              <button
                disabled={true}
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
