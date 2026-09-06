import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { WorkspaceUi, workspaceIcons, Resource, ListQuery } from '../shared/workspace';
import { WorkspaceApi } from '../core/workspace-api';
import { I18n } from '../core/i18n';
import { Notifications } from '../core/notifications';
import { NotificationItem, NotificationPage } from '../api/models';
import { UnreadNotifications } from '../core/unread-notifications';
@Component({
  selector: 'app-inbox',
  imports: [WorkspaceUi],
  providers: [workspaceIcons],
  template: ` <app-page-header title="notificationCentre" description="notificationIntro"
      ><button
        hlmBtn
        variant="outline"
        [disabled]="busy() || !data.value()?.unread"
        (click)="readAll()"
      >
        <ng-icon name="lucideCheck" />{{ 'markAllRead' | t }}
      </button></app-page-header
    >
    <div class="workspace-columns">
      <section hlmCard>
        <div hlmCardHeader>
          <h2 hlmCardTitle>
            {{ 'yourInbox' | t }}
            <span hlmBadge variant="secondary"
              >{{ data.value()?.unread ?? 0 }} {{ 'unread' | t }}</span
            >
          </h2>
          <p hlmCardDescription>{{ 'yourInboxHelp' | t }}</p>
        </div>
        <div hlmCardContent>
          <hlm-toggle-group
            type="single"
            variant="outline"
            [nullable]="false"
            [value]="query.text('filter', 'all')"
            (valueChange)="filter($event)"
            [attr.aria-label]="'notificationFilter' | t"
            ><button hlmToggleGroupItem value="all">{{ 'all' | t }}</button
            ><button hlmToggleGroupItem value="unread">{{ 'unread' | t }}</button></hlm-toggle-group
          >
          <app-page-state [state]="data.state()" (retry)="load()"
            ><ul aria-live="polite">
              @for (item of data.value()?.page?.items ?? []; track item.id) {
                <li class="workspace-notice" [class.unread]="!item.readAt">
                  <span class="workspace-icon" aria-hidden="true"
                    ><ng-icon
                      [name]="
                        item.kind === 'notificationSecurity' ? 'lucideShieldCheck' : 'lucideBell'
                      "
                  /></span>
                  <div class="min-w-0 flex-1">
                    <p class="font-medium">
                      {{ item.kind | t }}
                      @if (!item.readAt) {
                        <span class="workspace-unread-dot" [attr.aria-label]="'unread' | t"></span>
                      }
                    </p>
                    <p class="workspace-meta mt-1">{{ item.kind + 'Help' | t }}</p>
                    <p class="workspace-meta mt-2">{{ i18n.date(item.createdAt) }}</p>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <button
                        hlmBtn
                        variant="outline"
                        size="sm"
                        [disabled]="busy()"
                        (click)="open(item)"
                      >
                        {{ 'viewDetails' | t }}<ng-icon name="lucideArrowUpRight" />
                      </button>
                      @if (!item.readAt) {
                        <button
                          hlmBtn
                          variant="ghost"
                          size="sm"
                          [disabled]="busy()"
                          (click)="read(item)"
                        >
                          {{ 'markRead' | t }}
                        </button>
                      }
                    </div>
                  </div>
                </li>
              } @empty {
                <div hlmEmpty>
                  <div hlmEmptyHeader>
                    <div hlmEmptyMedia variant="icon"><ng-icon name="lucideInbox" /></div>
                    <h3 hlmEmptyTitle>{{ 'inboxEmpty' | t }}</h3>
                    <p hlmEmptyDescription>{{ 'inboxEmptyHelp' | t }}</p>
                  </div>
                </div>
              }
            </ul>
            <app-list-pager
              [total]="data.value()?.page?.total ?? 0"
              [page]="query.page"
              (pageChange)="query.set({ page: $event })"
          /></app-page-state>
        </div>
      </section>
      <aside hlmCard>
        <div hlmCardHeader>
          <h2 hlmCardTitle>{{ 'notificationPreferences' | t }}</h2>
          <p hlmCardDescription>{{ 'notificationPreferencesHelp' | t }}</p>
        </div>
        <div hlmCardContent>
          <div hlmField orientation="horizontal">
            <hlm-switch
              inputId="optional-email"
              [checked]="data.value()?.optionalEmailEnabled ?? false"
              [disabled]="busy() || data.state() !== 'ready'"
              (checkedChange)="preference($event)"
            /><label hlmFieldLabel for="optional-email">{{ 'optionalEmail' | t }}</label>
          </div>
          <p class="workspace-meta mt-3">{{ 'optionalEmailHelp' | t }}</p>
        </div>
        <div hlmCardFooter>
          <p class="workspace-meta">{{ 'securityEmailRequired' | t }}</p>
        </div>
      </aside>
    </div>`,
})
export class InboxPage {
  readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly toast = inject(Notifications);
  readonly unread = inject(UnreadNotifications);
  readonly router = inject(Router);
  readonly data = new Resource<NotificationPage>();
  readonly query = new ListQuery();
  readonly busy = signal(false);
  constructor() {
    this.query.connect(() => void this.load());
  }
  async load() {
    await this.data.load(() =>
      this.api.get('notifications', {
        pageNumber: this.query.page,
        unreadOnly: this.query.text('filter') === 'unread',
      }),
    );
    if (this.data.state() === 'ready') this.unread.count.set(this.data.value()!.unread);
  }
  filter(value: unknown) {
    if (value === 'all' || value === 'unread') void this.query.set({ filter: value, page: 1 });
  }
  async execute(action: () => Promise<unknown>) {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await action();
      await this.load();
    } catch {
      /* Central error feedback. */
    } finally {
      this.busy.set(false);
    }
  }
  read(item: NotificationItem) {
    return this.execute(() =>
      this.api.post('notifications/read?id=' + encodeURIComponent(item.id)),
    );
  }
  readAll() {
    return this.execute(() => this.api.post('notifications/read'));
  }
  async open(item: NotificationItem) {
    await this.read(item);
    if (['/profile', '/privacy', '/operations'].includes(item.link))
      await this.router.navigateByUrl(item.link);
  }
  preference(enabled: boolean) {
    return this.execute(async () => {
      await this.api.post('notifications/preferences', { optionalEmailEnabled: enabled });
      this.toast.success('preferencesSaved');
    });
  }
}
