import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import clsx from 'clsx';
import { signOut } from 'firebase/auth';
import { useRef, useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { Link, useParams } from 'wouter';
import { DisplayPic } from '../components/display-pic';
import { ImagePicker } from '../components/image-picker';
import { Post } from '../components/post';
import { auth } from '../firebase';
import {
  useFollow,
  useFollowUser,
  useInvalidateFollow,
} from '../hooks/follows';
import { IntentionsSort, useIntentions } from '../hooks/intentions';
import {
  useInvalidateFeedPosts,
  useInvalidateUserPosts,
  useUserPosts,
} from '../hooks/posts';
import { useInvalidateUser, useUpdateUser, useUser } from '../hooks/users';
import { useAuthState } from '../state/auth';

export const Profile: React.FC = () => {
  const { userId } = useParams();
  const { authUser } = useAuthState();

  if (userId == null) {
    throw new Error('Profile rendered without userId');
  }

  const { user } = useUser(userId);
  const { follow } = useFollow(userId);

  const filePickerRef = useRef<HTMLInputElement | null>(null);
  const updateUser = useUpdateUser();

  const followUser = useFollowUser();
  const invalidateFollow = useInvalidateFollow();
  const invalidateUser = useInvalidateUser();
  const invalidateUserPosts = useInvalidateUserPosts();
  const invalidateFeedPosts = useInvalidateFeedPosts();

  if (user == null) {
    return null;
  }

  const isAuthUser = userId === authUser?.uid;

  return (
    <div>
      <div className="flex items-center gap-2 p-4">
        <button
          disabled={!isAuthUser}
          onClick={() => filePickerRef.current?.click()}
        >
          <DisplayPic imageUri={user?.image} size={64} />
          <ImagePicker
            onPick={(dataUrl) =>
              updateUser({
                body: { image: dataUrl },
              }).then(() =>
                Promise.all([
                  invalidateUser(userId),
                  invalidateUserPosts(userId),
                  invalidateFeedPosts(userId),
                ]),
              )
            }
            ref={filePickerRef}
          />
        </button>
        <div className="flex grow flex-col gap-1">
          <div>{user.username}</div>
          {/* shouldn't need the second clause once users follow self */}
          {follow == null && !isAuthUser ? (
            <button
              onClick={() =>
                followUser({ userId }).then(() => invalidateFollow(userId))
              }
              className="rounded-sm bg-blue-200"
            >
              follow
            </button>
          ) : null}
          {follow != null && follow.status === 'pending' ? (
            <button disabled={true} className="rounded-sm bg-neutral-200">
              pending
            </button>
          ) : null}
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
            <ProfilePosts userId={userId} />
          </TabPanel>
          <TabPanel>
            <ProfileIntentions userId={userId} />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

interface ProfilePostsProps {
  userId: string;
}

const ProfilePosts: React.FC<ProfilePostsProps> = (props) => {
  const { posts } = useUserPosts(props.userId);

  if (posts == null) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1">
      {posts.map(({ id, data }) => {
        return <Post key={id} data={data} />;
      })}
    </div>
  );
};

interface ProfileIntentionsProps {
  userId: string;
}

const ProfileIntentions: React.FC<ProfileIntentionsProps> = (props) => {
  const [sortBy, setSortBy] = useState<IntentionsSort['by']>('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const { intentions } = useIntentions(props.userId, {
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
            <Link
              key={id}
              href={`/profile/${props.userId}/intention/${id}`}
              className="p-1"
            >
              <div>{data.name}</div>
              <div>stat</div>
            </Link>
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
