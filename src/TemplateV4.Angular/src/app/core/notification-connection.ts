import { HubConnectionBuilder, HubConnectionState, type HubConnection } from '@microsoft/signalr';
import type { AccessResponse } from '../api/models/access-response';

interface NotificationConnectionOptions {
  actor: string;
  url: string;
  access: () => AccessResponse | null;
  refresh: () => Promise<boolean>;
  active: () => boolean;
  changed: () => void;
}

export async function connectNotifications(
  options: NotificationConnectionOptions,
): Promise<HubConnection> {
  const accessToken = async () => {
    const access = options.access();
    if (!access || access.userId !== options.actor) return '';
    if (Date.parse(access.expiresAt) <= Date.now() + 30000) {
      try {
        if (!(await options.refresh())) return '';
      } catch {
        return '';
      }
    }
    const refreshed = options.access();
    return refreshed?.userId === options.actor ? refreshed.accessToken : '';
  };
  const changed = () => {
    if (options.active()) options.changed();
  };
  const connection = new HubConnectionBuilder()
    .withUrl(options.url, { accessTokenFactory: accessToken })
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (context) =>
        Math.min(1000 * 2 ** context.previousRetryCount, 60000),
    })
    .build();
  connection.on('notificationsChanged', changed);
  connection.onreconnected(changed);

  while (options.active() && connection.state === HubConnectionState.Disconnected) {
    try {
      await connection.start();
      changed();
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
  return connection;
}
