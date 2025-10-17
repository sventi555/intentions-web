import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { signOut } from 'firebase/auth';
import { useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { useParams } from 'wouter';
import { Post } from '../components/post';
import { auth } from '../firebase';
import { useDownloadUrl } from '../hooks/download-url';
import { IntentionsSort, useIntentions } from '../hooks/intentions';
import { useUserPosts } from '../hooks/posts';
import { useAuthState } from '../state/auth';

export const Profile: React.FC = () => {
  const { userId } = useParams();
  const { authUser } = useAuthState();

  if (userId == null) {
    throw new Error('Profile rendered without userId');
  }

  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => ({ username: 'booga', dpUri: 'test' }),
  });

  const { downloadUrl: dpUrl } = useDownloadUrl(user?.dpUri);

  if (user == null) {
    return null;
  }

  const isAuthUser = userId === authUser?.uid;

  return (
    <div>
      <div className="flex items-center gap-2 p-4">
        <img src={dpUrl} className="w-16 rounded-full" />
        <div className="flex grow flex-col gap-1">
          <div>{user.username}</div>
          <button className="rounded-sm bg-neutral-200">follow</button>
        </div>
        {isAuthUser ? (
          <button
            onClick={() => signOut(auth)}
            className="absolute top-1 right-2"
          >
            Sign out
          </button>
        ) : null}
      </div>
      <TabGroup>
        <TabList className="flex border-b">
          <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={clsx(
                  'grow border-b p-2 focus:outline-none',
                  selected
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent',
                )}
              >
                Posts
              </button>
            )}
          </Tab>
          <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={clsx(
                  'grow border-b p-2 focus:outline-none',
                  selected
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent',
                )}
              >
                Intentions
              </button>
            )}
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <ProfilePosts />
          </TabPanel>
          <TabPanel>
            <ProfileIntentions />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

const ProfilePosts: React.FC = () => {
  const authUser = useAuthState().authUser;

  if (authUser == null) {
    throw new Error('Must be signed in to view profile');
  }

  const { posts } = useUserPosts(authUser.uid);

  if (posts == null) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1">
      {posts.map(({ id, data }) => {
        return (
          <Post
            key={id}
            author={{
              id: data.userId,
              username: data.user.username,
              dpUri: data.user.image,
            }}
            createdAt={data.createdAt}
            intention={{ id: data.intentionId, name: data.intention.name }}
            imageUri={data.image}
            description={data.description}
          />
        );
      })}
    </div>
  );
};

const ProfileIntentions: React.FC = () => {
  const authUser = useAuthState().authUser;

  if (authUser == null) {
    throw new Error('Must be signed in to view profile');
  }

  const [sortBy, setSortBy] = useState<IntentionsSort['by']>('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const { intentions } = useIntentions(authUser.uid, {
    by: sortBy,
    dir: fixSortDir(sortBy, sortDir),
  });

  if (intentions == null) {
    return null;
  }

  return (
    <div className="p-1">
      <div className="flex items-center gap-1">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as IntentionsSort['by'])}
          className="rounded-sm border"
        >
          <option value="updatedAt">Recently active</option>
          <option value="name">Name</option>
          <option value="postCount">Total posts</option>
          <option value="createdAt">Created at</option>
        </select>
        <button onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}>
          {sortDir === 'asc' ? '↑' : '↓'}
        </button>
      </div>
      <div>
        {intentions.map(({ id, data }) => {
          return (
            <div key={id} className="p-1">
              <div>{data.name}</div>
              <div>stat</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const fixSortDir = (
  by: IntentionsSort['by'],
  dir: 'asc' | 'desc',
): IntentionsSort['dir'] => {
  if (by === 'name' || by === 'postCount') {
    return dir;
  }

  return dir === 'asc' ? 'desc' : 'asc';
};
