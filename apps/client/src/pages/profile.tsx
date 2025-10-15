import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { signOut } from 'firebase/auth';
import { Fragment } from 'react/jsx-runtime';
import { useParams } from 'wouter';
import { Post } from '../components/post';
import { auth } from '../firebase';
import { useDownloadUrl } from '../hooks/download-url';
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
            <div className="flex flex-col gap-1">
              {[1, 2, 3].map((i) => (
                <Post
                  key={i}
                  author={{
                    id: 'user-id',
                    username: 'user-1',
                    dpUri: 'dp-path',
                  }}
                  createdAt={1760387159012}
                  intention={{ id: 'intention-id', name: 'taste' }}
                  imageUri="image-path"
                  description="post description"
                />
              ))}
            </div>
          </TabPanel>
          <TabPanel>
            <div className="p-1">
              <div className="flex items-center gap-1">
                <select>
                  <option>Recently active</option>
                  <option>Name</option>
                  <option>Total posts</option>
                </select>
                <div>&#x2191;</div>
              </div>
              <div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-1">
                    <div>intention {i}</div>
                    <div>stat</div>
                  </div>
                ))}
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};
