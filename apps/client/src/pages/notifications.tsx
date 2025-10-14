import { PropsWithChildren } from 'react';
import { useDownloadUrl } from '../features/media/hooks/download-url';

export const Notifications: React.FC = () => {
  return (
    <div className="flex flex-col">
      <FollowRequestNotification
        sender={{ id: 'test-id', username: 'booga', dpUri: 'test-dp' }}
        isPending={true}
      />
      <FollowRequestNotification
        sender={{ id: 'test-id', username: 'booga', dpUri: 'test-dp' }}
        isPending={false}
      />
      <FollowApprovedNotification
        recipient={{ id: 'test-id', username: 'booga', dpUri: 'test-dp' }}
      />
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
      <img src={dpUrl} className="w-10 rounded-full" />
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
  return (
    <FollowNotificationWrapper user={props.sender}>
      <div className="flex grow justify-between">
        <div>
          {props.sender.username}{' '}
          {props.isPending ? 'requested to follow you' : 'followed you'}
        </div>
        {props.isPending ? (
          <div className="flex gap-1">
            <button className="rounded-sm bg-red-200 px-2">N</button>
            <button className="rounded-sm bg-green-200 px-2">Y</button>
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
      <div>{props.recipient.username} approved your follow request</div>
    </FollowNotificationWrapper>
  );
};
