import { useQueryClient } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { Link } from 'wouter';
import { useDownloadUrl } from '../hooks/download-url';
import { useRespondToFollow } from '../hooks/follows';
import { useNotifications } from '../hooks/notifications';
import { useAuthState } from '../state/auth';

export const Notifications: React.FC = () => {
  const authUser = useAuthState().authUser;
  if (authUser == null) {
    throw new Error('must be signed in to view notifications');
  }

  const { notifications } = useNotifications(authUser.uid);

  if (notifications == null) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {notifications.map((notification) => {
        const { data } = notification.data;
        const isRecipient = data.toUserId === authUser.uid;
        const otherUser = isRecipient
          ? {
              id: data.fromUserId,
              username: data.fromUser.username,
              dpUri: data.fromUser.image,
            }
          : {
              id: data.toUserId,
              username: data.toUser.username,
              dpUri: data.toUser.image,
            };

        if (isRecipient) {
          return (
            <FollowRequestNotification
              sender={otherUser}
              isPending={data.status === 'pending'}
            />
          );
        }

        return <FollowApprovedNotification recipient={otherUser} />;
      })}
    </div>
  );
};

interface NotificationUser {
  id: string;
  username: string;
  dpUri?: string;
}

interface FollowNotificationWrapperProps {
  user: NotificationUser;
}

const FollowNotificationWrapper: React.FC<
  PropsWithChildren<FollowNotificationWrapperProps>
> = (props) => {
  const { downloadUrl: dpUrl } = useDownloadUrl(props.user.dpUri);

  return (
    <div className="flex items-center gap-1 p-1">
      <Link href={`/profile/${props.user.id}`}>
        <img src={dpUrl} className="w-10 rounded-full" />
      </Link>
      {props.children}
    </div>
  );
};

interface FollowRequestNotificationProps {
  sender: NotificationUser;
  isPending: boolean;
}

const FollowRequestNotification: React.FC<FollowRequestNotificationProps> = (
  props,
) => {
  const authUser = useAuthState().authUser;
  if (authUser == null) {
    throw new Error('must be signed in to view notification');
  }

  const respondToFollow = useRespondToFollow();
  const queryClient = useQueryClient();

  return (
    <FollowNotificationWrapper user={props.sender}>
      <div className="flex grow items-center justify-between">
        <div>
          <Link href={`/profile/${props.sender.id}`}>
            {props.sender.username}
          </Link>{' '}
          {props.isPending ? 'requested to follow you' : 'followed you'}
        </div>
        {props.isPending ? (
          <div className="flex gap-1">
            <button
              onClick={() =>
                respondToFollow({
                  userId: props.sender.id,
                  body: { action: 'decline' },
                }).then(() =>
                  queryClient.invalidateQueries({
                    queryKey: ['notifications', authUser.uid],
                  }),
                )
              }
              className="rounded-sm bg-red-200 px-2"
            >
              N
            </button>
            <button
              onClick={() =>
                respondToFollow({
                  userId: props.sender.id,
                  body: { action: 'accept' },
                }).then(() =>
                  queryClient.invalidateQueries({
                    queryKey: ['notifications', authUser.uid],
                  }),
                )
              }
              className="rounded-sm bg-green-200 px-2"
            >
              Y
            </button>
          </div>
        ) : null}
      </div>
    </FollowNotificationWrapper>
  );
};

interface FollowApprovalNotificationProps {
  recipient: NotificationUser;
}

const FollowApprovedNotification: React.FC<FollowApprovalNotificationProps> = (
  props,
) => {
  return (
    <FollowNotificationWrapper user={props.recipient}>
      <div>
        <Link href={`/profile/${props.recipient.id}`}>
          {props.recipient.username}
        </Link>{' '}
        approved your follow request
      </div>
    </FollowNotificationWrapper>
  );
};
