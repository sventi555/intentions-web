import clsx from 'clsx';
import { PropsWithChildren, useState } from 'react';
import { Link } from 'wouter';
import { DisplayPic } from '../components/display-pic';
import { Check } from '../components/icons/check';
import { Close } from '../components/icons/close';
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
        <div className="text-center text-sm text-neutral-600">
          You'll be notified about follow requests and approvals
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {notifications.map((notification) => {
        const { data } = notification;

        const isRecipient = data.kind === 'request';
        const otherUser = {
          id: data.userId,
          username: data.user.username,
          dpUri: data.user.image,
        };

        if (isRecipient) {
          return (
            <FollowRequestNotification
              key={notification.id}
              sender={otherUser}
              isPending={data.status === 'pending'}
            />
          );
        }

        return (
          <FollowApprovedNotification
            key={notification.id}
            recipient={otherUser}
          />
        );
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
    <div className="flex items-center gap-1 p-2">
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

  const [submittingResponse, setSubmittingResponse] = useState<
    'accept' | 'decline' | null
  >(null);

  return (
    <FollowNotificationWrapper user={props.sender}>
      <div className="flex grow items-center justify-between">
        <div>
          <Link href={`/profile/${props.sender.id}`}>
            {props.sender.username}{' '}
            {props.isPending ? 'requested to follow you' : 'followed you'}
          </Link>
        </div>
        {props.isPending ? (
          <div className="flex gap-1">
            <button
              disabled={!!submittingResponse}
              onClick={() => {
                setSubmittingResponse('decline');
                respondToFollow({
                  userId: props.sender.id,
                  body: { action: 'decline' },
                })
                  .then(() => invalidateNotifications(authUser.uid))
                  .then(() => setSubmittingResponse(null));
              }}
              className={clsx(
                'rounded-sm p-1 px-2',
                !submittingResponse &&
                  'cursor-pointer bg-red-200 hover:bg-red-300',
                submittingResponse !== 'decline' && 'bg-red-100',
                submittingResponse === 'decline' &&
                  'cursor-progress bg-red-300',
              )}
            >
              <Close />
            </button>
            <button
              disabled={!!submittingResponse}
              onClick={() => {
                setSubmittingResponse('accept');
                respondToFollow({
                  userId: props.sender.id,
                  body: { action: 'accept' },
                })
                  .then(() => invalidateNotifications(authUser.uid))
                  .then(() => setSubmittingResponse(null));
              }}
              className={clsx(
                'rounded-sm p-1 px-2',
                !submittingResponse &&
                  'cursor-pointer bg-green-200 hover:bg-green-300',
                submittingResponse !== 'accept' && 'bg-green-100',
                submittingResponse === 'accept' &&
                  'cursor-progress bg-green-300',
              )}
            >
              <Check />
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
