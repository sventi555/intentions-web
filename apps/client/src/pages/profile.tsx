import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from '@headlessui/react';
import clsx from 'clsx';
import { format, intlFormatDistance } from 'date-fns';
import { signOut } from 'firebase/auth';
import { PropsWithChildren, useRef, useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { Link, useParams } from 'wouter';
import { Button } from '../components/atoms/button';
import { ImagePicker } from '../components/atoms/image-picker';
import { DisplayPic } from '../components/display-pic';
import { EllipsesVert } from '../components/icons';
import { PostsList } from '../components/posts-list';
import { auth } from '../firebase';
import {
  useFollow,
  useFollowUser,
  useInvalidateFollow,
  useRemoveFollow,
} from '../hooks/follows';
import {
  IntentionsSort,
  useIntentions,
  useInvalidateIntentions,
} from '../hooks/intentions';
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

  if (authUser == null) {
    throw new Error('must be signed in to view profile');
  }

  const { user } = useUser(userId);
  const { follow, isLoading: followLoading } = useFollow(userId);

  const filePickerRef = useRef<HTMLInputElement | null>(null);
  const updateUser = useUpdateUser();

  const followUser = useFollowUser();
  const removeFollow = useRemoveFollow();
  const invalidateFollow = useInvalidateFollow();
  const invalidateUser = useInvalidateUser();
  const invalidateUserPosts = useInvalidateUserPosts();
  const invalidateFeedPosts = useInvalidateFeedPosts();
  const invalidateIntentions = useInvalidateIntentions();

  const [submittingFollow, setSubmittingFollow] = useState(false);

  if (user == null || followLoading) {
    return null;
  }

  const isAuthUser = userId === authUser?.uid;

  return (
    <div className="flex grow flex-col">
      <div className="relative flex items-center gap-2 p-4 pr-8">
        <button
          disabled={!isAuthUser}
          onClick={() => filePickerRef.current?.click()}
          className={clsx(isAuthUser && 'cursor-pointer')}
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

          {follow == null ? (
            <Button
              disabled={submittingFollow}
              type="primary"
              onClick={() => {
                setSubmittingFollow(true);
                followUser({ userId })
                  .then(() => invalidateFollow(userId))
                  .then(() => setSubmittingFollow(false));
              }}
            >
              Follow
            </Button>
          ) : null}

          {follow?.status === 'pending' ? (
            <Button
              disabled={submittingFollow}
              type="secondary"
              onClick={() => {
                setSubmittingFollow(true);
                removeFollow({
                  userId: userId,
                  body: { direction: 'to' },
                })
                  .then(() => invalidateFollow(userId))
                  .then(() => setSubmittingFollow(false));
              }}
            >
              Pending
            </Button>
          ) : null}
        </div>

        {isAuthUser ? (
          <button
            onClick={() => signOut(auth)}
            className="absolute top-3 right-4 cursor-pointer text-neutral-800 underline"
          >
            Sign out
          </button>
        ) : null}

        {!isAuthUser && follow?.status === 'accepted' ? (
          <Menu>
            <MenuButton className="absolute top-2 right-2 cursor-pointer">
              <EllipsesVert />
            </MenuButton>
            <MenuItems anchor="bottom end" className="rounded bg-neutral-100">
              <MenuItem>
                <button
                  onClick={() =>
                    removeFollow({ userId, body: { direction: 'to' } }).then(
                      () =>
                        Promise.all([
                          invalidateFollow(userId),
                          invalidateUserPosts(userId),
                          invalidateIntentions(userId),
                          invalidateFeedPosts(authUser.uid),
                        ]),
                    )
                  }
                  className="cursor-pointer p-1 px-2 hover:bg-neutral-200"
                >
                  Unfollow
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
        ) : null}
      </div>

      <TabGroup className="flex grow flex-col">
        <TabList className="flex border-b border-neutral-300">
          <TabButton>Posts</TabButton>
          <TabButton>Intentions</TabButton>
        </TabList>

        <TabPanels className="flex grow flex-col">
          <TabPanel className="flex grow flex-col">
            {follow?.status === 'accepted' || isAuthUser ? (
              <ProfilePosts userId={userId} />
            ) : (
              <TabFallbackText>Follow user to view their posts</TabFallbackText>
            )}
          </TabPanel>
          <TabPanel className="flex grow flex-col">
            {follow?.status === 'accepted' || isAuthUser ? (
              <ProfileIntentions userId={userId} />
            ) : (
              <TabFallbackText>
                Follow user to view their intentions
              </TabFallbackText>
            )}
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

const TabButton: React.FC<PropsWithChildren> = (props) => {
  return (
    <Tab as={Fragment}>
      {({ selected }) => (
        <button
          className={clsx(
            'grow cursor-pointer p-2 focus:outline-none',
            selected && 'rounded-t-md bg-neutral-100 text-[#2C3B4E]',
          )}
        >
          {props.children}
        </button>
      )}
    </Tab>
  );
};

interface ProfilePostsProps {
  userId: string;
}

const ProfilePosts: React.FC<ProfilePostsProps> = (props) => {
  const { posts, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useUserPosts(props.userId);

  if (posts == null) {
    return null;
  }

  if (posts.length === 0) {
    return <TabFallbackText>No posts yet...</TabFallbackText>;
  }

  return (
    <PostsList
      posts={posts}
      fetchNextPage={fetchNextPage}
      fetchingPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
    />
  );
};

interface ProfileIntentionsProps {
  userId: string;
}

const ProfileIntentions: React.FC<ProfileIntentionsProps> = (props) => {
  const [sortBy, setSortBy] = useState<IntentionsSort['by']>('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const { intentions, isLoading: intentionsLoading } = useIntentions(
    props.userId,
    {
      by: sortBy,
      dir: fixSortDir(sortBy, sortDir),
    },
  );

  if (!intentionsLoading && intentions?.length === 0) {
    return <TabFallbackText>No intentions yet...</TabFallbackText>;
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center gap-2">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as IntentionsSort['by'])}
          className="cursor-pointer rounded-lg border border-neutral-300 p-1"
        >
          <option value="updatedAt">Recently active</option>
          <option value="name">Name</option>
          <option value="postCount">Total posts</option>
          <option value="createdAt">Created at</option>
        </select>
        <button
          onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
          className="cursor-pointer text-lg text-neutral-600"
        >
          {sortDir === 'asc' ? '↑' : '↓'}
        </button>
      </div>
      <div className="flex flex-col">
        {intentions?.map(({ id, data }, index) => {
          let stat = `${data.postCount} posts`;

          if (sortBy === 'updatedAt') {
            stat = `Updated ${intlFormatDistance(data.updatedAt, Date.now())}`;
          } else if (sortBy === 'createdAt') {
            stat = `Created ${format(data.createdAt, 'MMM d, yyyy')}`;
          }

          return (
            <Fragment key={id}>
              <Link
                href={`/profile/${props.userId}/intention/${id}`}
                className="p-1"
              >
                <div>{data.name}</div>
                {stat ? (
                  <div className="text-sm text-neutral-600">{stat}</div>
                ) : null}
              </Link>
              {index !== intentions.length - 1 ? (
                <div className="h-px w-full bg-neutral-200" />
              ) : null}
            </Fragment>
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

const TabFallbackText: React.FC<PropsWithChildren> = (props) => {
  return (
    <div className="flex grow flex-col items-center justify-center text-neutral-600">
      {props.children}
    </div>
  );
};
