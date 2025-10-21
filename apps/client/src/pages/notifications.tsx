import { PropsWithChildren } from 'react';
import { Link } from 'wouter';
import { DisplayPic } from '../components/display-pic';
import { useRespondToFollow } from '../hooks/follows';
import {
  useInvalidateNotifications,
  useNotifications,
} from '../hooks/notifications';
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

  if (notifications.length === 0) {
    return (
      <div className="flex grow flex-col items-center justify-center gap-2">
        <div>No notifications yet!</div>
        <div className="text-sm text-neutral-600">
          You'll be notified about follow requests and approvals
        </div>
      </div>
    );
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
  return (
    <div className="flex items-center gap-1 p-1">
      <Link href={`/profile/${props.user.id}`}>
        <DisplayPic imageUri={props.user.dpUri} size={40} />
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
  const invalidateNotifications = useInvalidateNotifications();

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
                }).then(() => invalidateNotifications(authUser.uid))
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
                }).then(() => invalidateNotifications(authUser.uid))
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
