import { HlmSelectImports } from '@spartan-ng/helm/select';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { WorkspaceUi, Resource, Confirmations, protectUnload } from '../shared/workspace';
import { WorkspaceApi } from '../core/workspace-api';
import { I18n } from '../core/i18n';
import { Notifications } from '../core/notifications';
import { SupportOptions, TicketDetail, UpdateTicket } from '../api/models';
import { ticketStates, ticketPriorities } from './support';

@Component({
  selector: 'app-support-detail',
  imports: [HlmSelectImports, WorkspaceUi, HlmTextareaImports],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: `<app-page-header title="supportTicketDetails" description="supportDetailHelp"
      ><a hlmBtn variant="outline" routerLink="/support">{{ 'support' | t }}</a
      ><button hlmBtn variant="outline" [disabled]="busy()" (click)="reload()">
        {{ 'refresh' | t }}
      </button></app-page-header
    >
    <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="reload()">
      @if (data.value(); as detail) {
        <div class="grid gap-6 lg:grid-cols-3">
          <div class="grid min-w-0 gap-6 lg:col-span-2">
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle class="break-words">{{ detail.ticket.subject }}</h2>
                <p hlmCardDescription>
                  {{ detail.ticket.requester }} · {{ i18n.date(detail.ticket.createdAt) }}
                </p>
              </div>
              <div hlmCardContent>
                <p class="whitespace-pre-wrap break-words">{{ detail.description }}</p>
                <div class="mt-4 flex flex-wrap gap-2">
                  <span hlmBadge>{{ 'ticket.' + detail.ticket.status | t }}</span
                  ><span hlmBadge variant="secondary">{{
                    'ticket.' + detail.ticket.priority | t
                  }}</span
                  ><span hlmBadge variant="outline">{{ detail.ticket.category }}</span>
                </div>
              </div>
            </section>
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ 'supportConversation' | t }}</h2>
                <p hlmCardDescription>{{ 'supportLatestFirst' | t }}</p>
              </div>
              <div hlmCardContent class="grid gap-4">
                @for (message of detail.messages.items; track message.id) {
                  <article class="rounded-md border p-4">
                    <div class="mb-2 flex flex-wrap items-center gap-2">
                      <strong>{{ message.author || ('deletedAccount' | t) }}</strong
                      ><time [attr.datetime]="message.at">{{ i18n.date(message.at) }}</time>
                      @if (message.internal) {
                        <span hlmBadge variant="secondary">{{ 'supportInternal' | t }}</span>
                      }
                    </div>
                    @if (message.kind === 'reply') {
                      <p class="whitespace-pre-wrap break-words">{{ message.body }}</p>
                    } @else {
                      <p>
                        {{ 'ticketEvent.' + message.kind | t }}
                        @if (message.kind === 'assignment') {
                          {{ message.body || ('supportUnassigned' | t) }}
                        }
                        @if (message.kind === 'status' || message.kind === 'priority') {
                          {{ 'ticket.' + message.body | t }}
                        }
                      </p>
                    }
                  </article>
                } @empty {
                  <p>{{ 'supportNoReplies' | t }}</p>
                }
              </div>
              <app-list-pager
                [total]="detail.messages.total"
                [page]="page"
                [size]="25"
                [busy]="busy() || data.refreshing()"
                (pageChange)="changePage($event)"
              />
            </section>
            @if (detail.ticket.status === 'Resolved' || detail.ticket.status === 'Closed') {
              <div hlmAlert>
                <h2 hlmAlertTitle>{{ 'supportReopen' | t }}</h2>
                <p hlmAlertDescription>{{ 'supportReopenHelp' | t }}</p>
                <button hlmBtn class="mt-4" [disabled]="busy()" (click)="reopen()">
                  {{ 'supportReopen' | t }}
                </button>
              </div>
            } @else {
              <section hlmCard>
                <div hlmCardHeader>
                  <h2 hlmCardTitle>{{ (internal ? 'supportInternal' : 'supportReply') | t }}</h2>
                  <p hlmCardDescription>
                    {{ (internal ? 'supportInternalHelp' : 'supportPublicHelp') | t }}
                  </p>
                </div>
                <form #replyForm="ngForm" (ngSubmit)="replyForm.valid && reply()">
                  <div hlmCardContent class="grid gap-4">
                    @if (detail.agent) {
                      <label hlmFieldLabel for="internal"
                        ><div hlmField orientation="horizontal">
                          <hlm-checkbox id="internal" name="internal" [(ngModel)]="internal" />
                          <div hlmFieldContent>
                            <span hlmFieldTitle>{{ 'supportInternal' | t }}</span>
                            <p hlmFieldDescription>{{ 'supportInternalHelp' | t }}</p>
                          </div>
                        </div></label
                      >
                    }
                    <div hlmField>
                      <label hlmFieldLabel for="reply">{{ 'supportMessage' | t }}</label
                      ><textarea
                        hlmTextarea
                        id="reply"
                        name="reply"
                        [(ngModel)]="body"
                        maxlength="10000"
                        required
                        rows="5"
                      ></textarea>
                    </div>
                  </div>
                  <div hlmCardFooter>
                    <button hlmBtn type="submit" [disabled]="busy() || !body.trim()">
                      {{ (internal ? 'supportSaveNote' : 'supportSendReply') | t }}
                    </button>
                  </div>
                </form>
              </section>
            }
          </div>
          <div class="grid min-w-0 content-start gap-6">
            @if (detail.agent) {
              @if (draft; as edit) {
                <section hlmCard>
                  <div hlmCardHeader>
                    <h2 hlmCardTitle>{{ 'supportTriage' | t }}</h2>
                    <p hlmCardDescription>{{ 'supportTriageHelp' | t }}</p>
                  </div>
                  <form (ngSubmit)="update()">
                    <div hlmCardContent class="grid gap-4">
                      <div hlmField>
                        <label hlmFieldLabel for="status">{{ 'status' | t }}</label
                        ><hlm-select
                          [value]="edit.status"
                          [itemToString]="ticketLabel"
                          (valueChange)="edit.status = $event ?? edit.status"
                        >
                          <hlm-select-trigger buttonId="status" class="w-full"
                            ><hlm-select-value
                          /></hlm-select-trigger>
                          <hlm-select-content *hlmSelectPortal [ariaLabel]="'status' | t">
                            @for (s of states; track s) {
                              <hlm-select-item [value]="s">{{ 'ticket.' + s | t }}</hlm-select-item>
                            }
                          </hlm-select-content>
                        </hlm-select>
                      </div>
                      <div hlmField>
                        <label hlmFieldLabel for="priority">{{ 'supportPriority' | t }}</label
                        ><hlm-select
                          [value]="edit.priority"
                          [itemToString]="ticketLabel"
                          (valueChange)="edit.priority = $event ?? edit.priority"
                        >
                          <hlm-select-trigger buttonId="priority" class="w-full"
                            ><hlm-select-value
                          /></hlm-select-trigger>
                          <hlm-select-content *hlmSelectPortal [ariaLabel]="'supportPriority' | t">
                            @for (s of priorities; track s) {
                              <hlm-select-item [value]="s">{{ 'ticket.' + s | t }}</hlm-select-item>
                            }
                          </hlm-select-content>
                        </hlm-select>
                      </div>
                      <div hlmField>
                        <label hlmFieldLabel for="category">{{ 'supportCategory' | t }}</label
                        ><hlm-select
                          [value]="edit.categoryId"
                          [itemToString]="categoryLabel"
                          (valueChange)="edit.categoryId = $event ?? edit.categoryId"
                        >
                          <hlm-select-trigger buttonId="category" class="w-full"
                            ><hlm-select-value
                          /></hlm-select-trigger>
                          <hlm-select-content *hlmSelectPortal [ariaLabel]="'supportCategory' | t"
                            ><hlm-select-item [value]="detail.ticket.categoryId">
                              {{ detail.ticket.category }}
                            </hlm-select-item>
                            @for (c of options.value()?.categories ?? []; track c.id) {
                              @if (c.active && c.id !== detail.ticket.categoryId) {
                                <hlm-select-item [value]="c.id">{{ c.name }}</hlm-select-item>
                              }
                            }
                          </hlm-select-content>
                        </hlm-select>
                      </div>
                      <div hlmField>
                        <label hlmFieldLabel for="agent-search">{{ 'supportFindAgent' | t }}</label
                        ><input
                          hlmInput
                          id="agent-search"
                          name="agent-search"
                          [(ngModel)]="agentSearch"
                          maxlength="120"
                        /><button hlmBtn variant="outline" type="button" (click)="loadOptions()">
                          {{ 'search' | t }}
                        </button>
                      </div>
                      <app-page-state
                        [state]="options.state()"
                        [refreshError]="options.refreshError()"
                        (retry)="loadOptions()"
                        ><div hlmField>
                          <label hlmFieldLabel for="assignee">{{ 'supportAssignee' | t }}</label
                          ><hlm-select
                            [value]="edit.assigneeId ?? ''"
                            [itemToString]="assigneeLabel"
                            (valueChange)="edit.assigneeId = $event || null"
                          >
                            <hlm-select-trigger buttonId="assignee" class="w-full"
                              ><hlm-select-value
                            /></hlm-select-trigger>
                            <hlm-select-content *hlmSelectPortal [ariaLabel]="'supportAssignee' | t"
                              ><hlm-select-item value="">{{
                                'supportUnassigned' | t
                              }}</hlm-select-item>
                              @if (detail.ticket.assigneeId) {
                                <hlm-select-item [value]="detail.ticket.assigneeId">
                                  {{ detail.ticket.assignee }}
                                </hlm-select-item>
                              }
                              @for (a of options.value()?.agents ?? []; track a.id) {
                                @if (a.id !== detail.ticket.assigneeId) {
                                  <hlm-select-item [value]="a.id">{{ a.name }}</hlm-select-item>
                                }
                              }
                            </hlm-select-content>
                          </hlm-select>
                        </div></app-page-state
                      >
                    </div>
                    <div hlmCardFooter>
                      <button hlmBtn type="submit" [disabled]="busy() || !triageChanged()">
                        {{ 'save' | t }}
                      </button>
                    </div>
                  </form>
                </section>
              }
            }
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ 'supportAttachments' | t }}</h2>
                <p hlmCardDescription>{{ 'supportAttachmentHelp' | t }}</p>
              </div>
              <div hlmCardContent class="grid gap-4">
                @for (a of detail.attachments; track a.id) {
                  <button
                    hlmBtn
                    variant="outline"
                    class="max-w-full"
                    (click)="download(a.id, a.name)"
                  >
                    <span class="truncate">{{ a.name }}</span>
                  </button>
                } @empty {
                  <p>{{ 'supportNoAttachments' | t }}</p>
                }
                @if (detail.ticket.status !== 'Closed' && detail.ticket.status !== 'Resolved') {
                  <div hlmField>
                    <label hlmFieldLabel for="attachment">{{ 'supportAttach' | t }}</label
                    ><input
                      hlmInput
                      id="attachment"
                      type="file"
                      [disabled]="busy()"
                      (change)="attach($event)"
                    />
                    <p hlmFieldDescription>{{ 'supportAttachmentsPublic' | t }}</p>
                  </div>
                }
              </div>
            </section>
          </div>
        </div>
      }
    </app-page-state>`,
})
export class SupportDetailPage {
  readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly toast = inject(Notifications);
  readonly confirm = inject(Confirmations);
  readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id')!;
  readonly data = new Resource<TicketDetail>();
  readonly options = new Resource<SupportOptions>();
  readonly busy = signal(false);
  readonly states = ticketStates;
  readonly priorities = ticketPriorities;
  readonly ticketLabel = (value: string) => this.i18n.text('ticket.' + value);
  readonly categoryLabel = (id: string) =>
    id === this.data.value()?.ticket.categoryId
      ? this.data.value()!.ticket.category
      : (this.options.value()?.categories.find((category) => category.id === id)?.name ?? id);
  readonly assigneeLabel = (id: string) =>
    !id
      ? this.i18n.text('supportUnassigned')
      : id === this.data.value()?.ticket.assigneeId
        ? (this.data.value()!.ticket.assignee ?? '')
        : (this.options.value()?.agents.find((agent) => agent.id === id)?.name ?? id);

  body = '';
  internal = false;
  page = 1;
  agentSearch = '';
  draft: UpdateTicket | null = null;
  constructor() {
    void this.load();
    void this.loadOptions();
  }
  async load() {
    if (
      await this.data.load((signal) =>
        this.api.get(`support/${this.id}`, { pageNumber: this.page }, signal),
      )
    ) {
      const t = this.data.value()!.ticket;
      this.draft = {
        id: t.id,
        status: t.status,
        priority: t.priority,
        categoryId: t.categoryId,
        assigneeId: t.assigneeId,
        version: t.version,
      };
    }
  }
  loadOptions() {
    return this.options.load((signal) =>
      this.api.get('support/options', { search: this.agentSearch }, signal),
    );
  }
  triageChanged() {
    const t = this.data.value()?.ticket;
    const d = this.draft;
    return !!(
      t &&
      d &&
      (t.status !== d.status ||
        t.priority !== d.priority ||
        t.categoryId !== d.categoryId ||
        t.assigneeId !== d.assigneeId)
    );
  }
  hasUnsavedChanges() {
    return !!this.body || this.triageChanged();
  }
  beforeUnload(e: BeforeUnloadEvent) {
    protectUnload(e, this.hasUnsavedChanges());
  }
  async reload() {
    if (!this.hasUnsavedChanges() || (await this.confirm.ask('unsavedTitle', 'unsavedHelp'))) {
      this.body = '';
      await this.load();
    }
  }
  async changePage(page: number) {
    if (this.triageChanged() && !(await this.confirm.ask('unsavedTitle', 'unsavedHelp'))) return;
    this.page = page;
    await this.load();
  }
  async mutate(
    path: string,
    body: unknown,
    done: () => void = () => {
      /* No draft reset needed. */
    },
  ) {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post(path, body);
      done();
      this.toast.success('supportSaved');
      await this.load();
    } catch {
      /* Central errors; preserve draft. */
    } finally {
      this.busy.set(false);
    }
  }
  async reply() {
    if (this.triageChanged() && !(await this.confirm.ask('unsavedTitle', 'unsavedHelp'))) return;
    await this.mutate(
      'support/reply',
      {
        id: this.id,
        body: this.body,
        internal: this.internal,
        version: this.data.value()!.ticket.version,
      },
      () => {
        this.body = '';
        this.page = 1;
      },
    );
  }
  update() {
    if (this.draft) void this.mutate('support/update', this.draft);
  }
  async reopen() {
    if (this.triageChanged() && !(await this.confirm.ask('unsavedTitle', 'unsavedHelp'))) return;
    const t = this.data.value()!.ticket;
    await this.mutate('support/update', {
      id: t.id,
      status: 'Open',
      priority: t.priority,
      categoryId: t.categoryId,
      assigneeId: t.assigneeId,
      version: t.version,
    });
  }
  async attach(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      this.toast.error({ title: this.i18n.text('supportFileSize') });
      input.value = '';
      return;
    }
    if (this.triageChanged() && !(await this.confirm.ask('unsavedTitle', 'unsavedHelp'))) {
      input.value = '';
      return;
    }
    try {
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      await this.mutate('support/attachments', {
        id: this.id,
        name: file.name,
        content,
        version: this.data.value()!.ticket.version,
      });
    } catch {
      this.toast.error({ title: this.i18n.text('supportFileReadFailed') });
    } finally {
      input.value = '';
    }
  }
  async download(id: string, name: string) {
    try {
      await this.api.download(`support/${this.id}/attachments/${id}`, name);
    } catch {
      /* Central error UI. */
    }
  }
}
