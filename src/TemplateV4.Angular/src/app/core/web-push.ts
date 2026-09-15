import { Injectable, inject } from '@angular/core';
import { Auth } from './auth';
import { WorkspaceApi } from './workspace-api';

export interface WebPushStatus {
  enabled: boolean;
  showPreview: boolean;
  publicKey?: string | null;
}

@Injectable({ providedIn: 'root' })
export class WebPush {
  private readonly api = inject(WorkspaceApi);
  private readonly auth = inject(Auth);
  readonly supported =
    window.isSecureContext &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

  async register(publicKey: string) {
    // Request permission directly from the user's click, before awaiting network or worker setup.
    if (!this.supported || (await Notification.requestPermission()) !== 'granted') return false;
    const registration = await navigator.serviceWorker.register('/push-sw.js');
    await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    const ownerKey = 'templatev4-push-owner';
    const owner = this.auth.access()?.userId;
    let previousOwner: string | null = null;
    try {
      previousOwner = localStorage.getItem(ownerKey);
    } catch {
      /* Recreate when ownership cannot be checked. */
    }
    const key = Uint8Array.from(atob(publicKey.replace(/-/g, '+').replace(/_/g, '/')), (c) =>
      c.charCodeAt(0),
    );
    if (
      subscription &&
      (previousOwner !== owner ||
        !subscription.options.applicationServerKey ||
        !sameKey(new Uint8Array(subscription.options.applicationServerKey), key))
    ) {
      await subscription.unsubscribe();
      subscription = null;
    }
    subscription ??= await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: key,
    });
    const json = subscription.toJSON();
    await this.api.post('notifications/push/subscribe', {
      endpoint: subscription.endpoint,
      p256dh: json.keys?.['p256dh'],
      auth: json.keys?.['auth'],
    });
    try {
      localStorage.setItem(ownerKey, owner ?? '');
    } catch {
      /* Subscription still works without storage. */
    }
    return true;
  }
}

function sameKey(left: Uint8Array, right: Uint8Array) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
