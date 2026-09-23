import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmBubbleImports } from '@spartan-ng/helm/bubble';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { WorkspaceUi, Resource, Confirmations, protectUnload } from '../../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import { WorkspaceApi } from '../../../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import { I18n } from '../../../../../../src/TemplateV4.Angular/src/app/core/i18n';
import { Notifications } from '../../../../../../src/TemplateV4.Angular/src/app/features/notifications/notifications';
import { SupportOptions, TicketDetail, UpdateTicket } from '../../../../../../src/TemplateV4.Angular/src/app/api/models';
import { TicketAttachments } from '../../attachments/ticket-attachments';
import { ticketStates, ticketPriorities } from '../ticket-options';

@Component({
  selector: 'app-support-detail',
  imports: [HlmSelectImports, HlmBubbleImports, HlmDrawerImports, WorkspaceUi, HlmTextareaImports, TicketAttachments],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: `@if (!embedded()) { <app-page-header title="supportTicketDetails" description="supportDetailHelp"
      ><a hlmBtn variant="outline" routerLink="/support/tickets">{{ 'supportTickets' | t }}</a
      ><button hlmBtn variant="outline" [disabled]="busy()" (click)="reload()">
        {{ 'refresh' | t }}
      </button></app-page-header
    > }
    <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="reload()">
      @if (data.value(); as detail) {
        <div class="grid gap-6 lg:grid-cols-3">
          <div class="min-w-0 lg:col-span-2">
            <section hlmCard class="min-w-0 overflow-visible">
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ 'supportConversation' | t }}</h2>
                <div hlmCardDescription class="flex flex-wrap items-center gap-2">
                  <span class="min-w-0 break-words">{{ reference(detail.ticket.referenceNumber) }} · {{ detail.ticket.requester }}</span>
                  <span hlmBadge>{{ 'ticket.' + detail.ticket.status | t }}</span>
                  @if (detail.ticket.status !== 'Draft') {
                    <span hlmBadge variant="secondary">{{ 'ticket.' + detail.ticket.priority | t }}</span>
                  }
                  @if (detail.ticket.category) { <span hlmBadge variant="outline">{{ detail.ticket.category }}</span> }
                </div>
                @if (detail.agent && detail.ticket.status !== 'Draft') {
                  @if (draft; as edit) {
                    <div hlmCardAction>
                      <hlm-drawer
                        direction="right"
                        [state]="manageOpen() ? 'open' : 'closed'"
                        [disableClose]="busy() || triageChanged()"
                        [closeGuard]="confirmManageClose"
                        [closeLabel]="'close' | t"
                        (stateChanged)="manageStateChanged($event)"
                      >
                        <button hlmBtn hlmDrawerTrigger variant="outline" type="button" [disabled]="busy()">
                          {{ 'edit' | t }}
                        </button>
                        <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md">
                          <hlm-drawer-header>
                            <h2 hlmDrawerTitle>{{ 'supportTriage' | t }}</h2>
                            <p hlmDrawerDescription>{{ 'supportTriageHelp' | t }}</p>
                          </hlm-drawer-header>
                          <form class="flex min-h-0 flex-1 flex-col" (ngSubmit)="update()">
                            <div hlmDrawerBody class="grid content-start gap-4 overflow-y-auto">
                              <div hlmField>
                                <label hlmFieldLabel for="status">{{ 'status' | t }}</label>
                                <hlm-select
                                  [value]="edit.status"
                                  [itemToString]="ticketLabel"
                                  (valueChange)="edit.status = $event ?? edit.status"
                                >
                                  <hlm-select-trigger buttonId="status" class="w-full"><hlm-select-value /></hlm-select-trigger>
                                  <hlm-select-content *hlmSelectPortal [ariaLabel]="'status' | t">
                                    @for (s of states; track s) {
                                      <hlm-select-item [value]="s">{{ 'ticket.' + s | t }}</hlm-select-item>
                                    }
                                  </hlm-select-content>
                                </hlm-select>
                              </div>
                              <div hlmField>
                                <label hlmFieldLabel for="priority">{{ 'supportPriority' | t }}</label>
                                <hlm-select
                                  [value]="edit.priority"
                                  [itemToString]="ticketLabel"
                                  (valueChange)="edit.priority = $event ?? edit.priority"
                                >
                                  <hlm-select-trigger buttonId="priority" class="w-full"><hlm-select-value /></hlm-select-trigger>
                                  <hlm-select-content *hlmSelectPortal [ariaLabel]="'supportPriority' | t">
                                    @for (s of priorities; track s) {
                                      <hlm-select-item [value]="s">{{ 'ticket.' + s | t }}</hlm-select-item>
                                    }
                                  </hlm-select-content>
                                </hlm-select>
                              </div>
                              <div hlmField>
                                <label hlmFieldLabel for="category">{{ 'supportCategory' | t }}</label>
                                <hlm-select
                                  [value]="edit.categoryId"
                                  [itemToString]="categoryLabel"
                                  (valueChange)="edit.categoryId = $event ?? edit.categoryId"
                                >
                                  <hlm-select-trigger buttonId="category" class="w-full"><hlm-select-value /></hlm-select-trigger>
                                  <hlm-select-content *hlmSelectPortal [ariaLabel]="'supportCategory' | t">
                                    <hlm-select-item [value]="detail.ticket.categoryId">{{ detail.ticket.category }}</hlm-select-item>
                                    @for (c of options.value()?.categories ?? []; track c.id) {
                                      @if (c.active && c.id !== detail.ticket.categoryId) {
                                        <hlm-select-item [value]="c.id">{{ c.name }}</hlm-select-item>
                                      }
                                    }
                                  </hlm-select-content>
                                </hlm-select>
                              </div>
                              <div hlmField>
                                <label hlmFieldLabel for="agent-search">{{ 'supportFindAgent' | t }}</label>
                                <input hlmInput id="agent-search" name="agent-search" [(ngModel)]="agentSearch" maxlength="120" />
                                <button hlmBtn variant="outline" type="button" (click)="loadOptions()">{{ 'search' | t }}</button>
                              </div>
                              <app-page-state [state]="options.state()" [refreshError]="options.refreshError()" (retry)="loadOptions()">
                                <div hlmField>
                                  <label hlmFieldLabel for="assignee">{{ 'supportAssignee' | t }}</label>
                                  <hlm-select
                                    [value]="edit.assigneeId ?? ''"
                                    [itemToString]="assigneeLabel"
                                    (valueChange)="edit.assigneeId = $event || null"
                                  >
                                    <hlm-select-trigger buttonId="assignee" class="w-full"><hlm-select-value /></hlm-select-trigger>
                                    <hlm-select-content *hlmSelectPortal [ariaLabel]="'supportAssignee' | t">
                                      <hlm-select-item value="">{{ 'supportUnassigned' | t }}</hlm-select-item>
                                      @if (detail.ticket.assigneeId) {
                                        <hlm-select-item [value]="detail.ticket.assigneeId">{{ detail.ticket.assignee }}</hlm-select-item>
                                      }
                                      @for (a of options.value()?.agents ?? []; track a.id) {
                                        @if (a.id !== detail.ticket.assigneeId) {
                                          <hlm-select-item [value]="a.id">{{ a.name }}</hlm-select-item>
                                        }
                                      }
                                    </hlm-select-content>
                                  </hlm-select>
                                </div>
                              </app-page-state>
                            </div>
                            <hlm-drawer-footer>
                              <button hlmBtn type="submit" [disabled]="busy() || !triageChanged()">{{ 'save' | t }}</button>
                            </hlm-drawer-footer>
                          </form>
                        </hlm-drawer-content>
                      </hlm-drawer>
                    </div>
                  }
                }
              </div>
              <div hlmCardContent class="min-w-0">
                @if (detail.ticket.status === 'Draft') {
                  <p class="whitespace-pre-wrap break-words">{{ detail.description || '—' }}</p>
                }
                @if (detail.ticket.status === 'Draft') {
                  <div class="mt-6 border-t border-border pt-6">
                    <h3 class="font-semibold">{{ 'supportEditDraft' | t }}</h3>
                    <p class="text-muted-foreground">{{ 'supportDraftHelp' | t }}</p>
                    <div class="mt-4 grid gap-4">
                      <div hlmField>
                        <label hlmFieldLabel for="draft-subject">{{ 'supportSubject' | t }}</label>
                        <input hlmInput id="draft-subject" [(ngModel)]="draftSubject" maxlength="180" />
                      </div>
                      <div hlmField>
                        <label hlmFieldLabel for="draft-category">{{ 'supportCategory' | t }}</label>
                        <hlm-select [value]="draftCategory || undefined" [itemToString]="categoryLabel" (valueChange)="draftCategory = $event ?? ''">
                          <hlm-select-trigger buttonId="draft-category" class="w-full"><hlm-select-value [placeholder]="'supportChooseCategory' | t" /></hlm-select-trigger>
                          <hlm-select-content *hlmSelectPortal [ariaLabel]="'supportCategory' | t">
                            @for (category of options.value()?.categories ?? []; track category.id) {
                              @if (category.active) { <hlm-select-item [value]="category.id">{{ category.name }}</hlm-select-item> }
                            }
                          </hlm-select-content>
                        </hlm-select>
                      </div>
                      <div hlmField>
                        <label hlmFieldLabel for="draft-description">{{ 'supportMessage' | t }}</label>
                        <textarea hlmTextarea id="draft-description" [(ngModel)]="draftDescription" maxlength="10000" rows="6"></textarea>
                      </div>
                    </div>
                    <div class="mt-4 flex flex-wrap gap-2">
                      <button hlmBtn type="button" variant="outline" [disabled]="busy() || !draftChanged()" (click)="saveDraft()">{{ 'supportSaveDraft' | t }}</button>
                      <button hlmBtn type="button" [disabled]="busy() || !draftSubject.trim() || !draftDescription.trim() || !draftCategory" (click)="saveDraft(true)">{{ 'supportSubmit' | t }}</button>
                    </div>
                  </div>
                } @else {
                  <div>
                    <div hlmBubbleGroup class="-mx-(--card-spacing) gap-0">
                      <article class="flex min-w-0 flex-col gap-1 px-[calc(var(--card-spacing)+0.5rem)] py-[0.6875rem] transition-colors hover:bg-muted/40 motion-reduce:transition-none">
                        <div class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <strong>{{ detail.ticket.requester }}</strong>
                          <time class="ms-auto shrink-0 whitespace-nowrap" [attr.datetime]="detail.ticket.createdAt">{{ i18n.date(detail.ticket.createdAt) }}</time>
                        </div>
                        <div hlmBubble variant="muted" class="max-w-[min(80%,36rem)]">
                          <div hlmBubbleContent>
                            <strong class="block break-words">{{ detail.ticket.subject }}</strong>
                            <p class="mt-1 whitespace-pre-wrap break-words">{{ detail.description || '—' }}</p>
                          </div>
                        </div>
                      </article>
                      @for (message of detail.messages.items.slice().reverse(); track message.id) {
                        @if (message.kind === 'reply') {
                          @let outgoing = !message.internal && !!message.authorId && message.authorId !== detail.ticket.requesterId;
                          <article class="flex min-w-0 flex-col gap-1 px-[calc(var(--card-spacing)+0.5rem)] py-[0.6875rem] transition-colors hover:bg-muted/40 motion-reduce:transition-none">
                            <div class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <strong>{{ message.author || ('deletedAccount' | t) }}</strong>
                              @if (message.internal) {
                                <span hlmBadge variant="secondary">{{ 'supportInternal' | t }}</span>
                              }
                              <time class="ms-auto shrink-0 whitespace-nowrap" [attr.datetime]="message.at">{{ i18n.date(message.at) }}</time>
                            </div>
                            <div hlmBubble class="max-w-[min(80%,36rem)]" [align]="outgoing ? 'end' : 'start'" [variant]="message.internal ? 'outline' : outgoing ? 'default' : 'muted'">
                              <div hlmBubbleContent>
                                <p class="whitespace-pre-wrap break-words">{{ message.body }}</p>
                              </div>
                            </div>
                          </article>
                        } @else {
                          <article class="flex min-w-0 items-center gap-2 px-[calc(var(--card-spacing)+0.5rem)] py-[0.5625rem] text-xs text-muted-foreground transition-colors hover:bg-muted/40 motion-reduce:transition-none">
                            <p class="min-w-0 flex-1 truncate">
                              <strong class="text-foreground">{{ message.author || ('deletedAccount' | t) }}</strong>
                              {{ activityText(message.kind, message.body) }}
                              @if (message.internal) {
                                · {{ 'supportInternal' | t }}
                              }
                            </p>
                            <time class="ms-auto shrink-0 whitespace-nowrap" [attr.datetime]="message.at">{{ i18n.date(message.at) }}</time>
                          </article>
                        }
                      }
                    </div>
                    <app-list-pager
                      [total]="detail.messages.total"
                      [page]="page"
                      [size]="25"
                      [busy]="busy() || data.refreshing()"
                      (pageChange)="changePage($event)"
                    />
                    @if (detail.ticket.status === 'Resolved' || detail.ticket.status === 'Closed') {
                      <div hlmAlert class="mt-4">
                        <h3 hlmAlertTitle>{{ 'supportReopen' | t }}</h3>
                        <p hlmAlertDescription>{{ 'supportReopenHelp' | t }}</p>
                        <button hlmBtn class="mt-4" [disabled]="busy()" (click)="reopen()">
                          {{ 'supportReopen' | t }}
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>
              @if (detail.ticket.status !== 'Draft' && detail.ticket.status !== 'Resolved' && detail.ticket.status !== 'Closed') {
                <form hlmCardFooter class="sticky bottom-0 z-10 grid max-h-[60vh] gap-4 overflow-y-auto" #replyForm="ngForm" (ngSubmit)="replyForm.valid && reply()">
                  <div>
                    <h3 class="font-semibold">{{ (internal ? 'supportInternal' : 'supportReply') | t }}</h3>
                    <p class="text-muted-foreground">{{ (internal ? 'supportInternalHelp' : 'supportPublicHelp') | t }}</p>
                  </div>
                  <div hlmField>
                    <label hlmFieldLabel for="reply">{{ 'supportMessage' | t }}</label
                    ><textarea
                      hlmTextarea
                      id="reply"
                      name="reply"
                      [(ngModel)]="body"
                      maxlength="10000"
                      required
                      rows="3"
                    ></textarea>
                  </div>
                  <div class="flex flex-wrap items-center justify-end gap-3">
                    @if (detail.agent) {
                      <label hlmFieldLabel for="internal" class="w-auto">
                        <span hlmField orientation="horizontal" class="w-auto gap-2">
                          <hlm-checkbox inputId="internal" name="internal" [(ngModel)]="internal" />
                          <span hlmFieldTitle>{{ 'supportInternal' | t }}</span>
                        </span>
                      </label>
                    }
                    <button hlmBtn type="submit" [disabled]="busy() || !body.trim()">
                      {{ (internal ? 'supportSaveNote' : 'supportSendReply') | t }}
                    </button>
                  </div>
                </form>
              }
            </section>
          </div>
          <div class="grid min-w-0 content-start gap-6">
            @if (detail.ticket.status !== 'Draft') { <app-ticket-attachments
              [ticketId]="id()!"
              [version]="detail.ticket.version"
              [attachments]="detail.attachments"
              [canUpload]="detail.ticket.status !== 'Closed' && detail.ticket.status !== 'Resolved'"
              [disabled]="busy()"
              [beforeAttach]="confirmAttachment"
              (busyChange)="busy.set($event)"
              [reloadTicket]="reloadAttachments"
            /> }
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
  readonly ticketId = input<string>();
  readonly embedded = input(false);
  readonly changed = output<void>();
  private readonly route = inject(ActivatedRoute);
  readonly id = computed(() => this.ticketId() ?? this.route.snapshot.paramMap.get('id'));
  reference(number: number) { return `TK-${String(number).padStart(6, '0')}`; }
  activityText(kind: string, body: string) {
    if (kind === 'status' || kind === 'priority')
      return this.i18n.text('ticketEvent.' + kind).replace('{value}', this.i18n.text('ticket.' + body));
    return this.i18n.text(kind === 'assignment' && !body ? 'ticketEvent.unassigned' : 'ticketEvent.' + kind);
  }
  readonly data = new Resource<TicketDetail>();
  readonly options = new Resource<SupportOptions>();
  readonly busy = signal(false);
  readonly manageOpen = signal(false);
  readonly confirmManageClose = async () =>
    !this.busy() && (!this.triageChanged() || (await this.confirm.ask('unsavedTitle', 'unsavedHelp')));
  readonly reloadAttachments = () => this.load();
  readonly confirmAttachment = async () =>
    !this.triageChanged() || (await this.confirm.ask('unsavedTitle', 'unsavedHelp'));
  readonly states = ticketStates.filter((state) => state !== 'Draft');
  readonly priorities = ticketPriorities;
  readonly ticketLabel = (value: string) => this.i18n.text('ticket.' + value);
  readonly categoryLabel = (id: string) =>
    id === this.data.value()?.ticket.categoryId
      ? (this.data.value()!.ticket.category ?? '')
      : (this.options.value()?.categories.find((category) => category.id === id)?.name ?? id);
  readonly assigneeLabel = (id: string) =>
    !id
      ? this.i18n.text('supportUnassigned')
      : id === this.data.value()?.ticket.assigneeId
        ? (this.data.value()!.ticket.assignee ?? '')
        : (this.options.value()?.agents.find((agent) => agent.id === id)?.name ?? id);

  body = '';
  draftSubject = '';
  draftDescription = '';
  draftCategory = '';
  internal = false;
  page = 1;
  agentSearch = '';
  draft: UpdateTicket | null = null;
  constructor() {
    effect(() => {
      if (!this.id()) return;
      untracked(() => {
        this.data.value.set(null);
        void this.load();
      });
    });
    void this.loadOptions();
  }
  async load() {
    if (
      await this.data.load((signal) =>
        this.api.get(`support/${this.id()}`, { pageNumber: this.page }, signal),
      )
    ) {
      const t = this.data.value()!.ticket;
      this.draftSubject = t.subject;
      this.draftDescription = this.data.value()!.description;
      this.draftCategory = t.categoryId ?? '';
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
  manageStateChanged(state: 'open' | 'closed') {
    this.manageOpen.set(state === 'open');
    if (state === 'closed' && this.draft && this.data.value()) {
      const ticket = this.data.value()!.ticket;
      Object.assign(this.draft, {
        status: ticket.status,
        priority: ticket.priority,
        categoryId: ticket.categoryId,
        assigneeId: ticket.assigneeId,
      });
    }
  }
  draftChanged() {
    const detail = this.data.value();
    return !!detail && detail.ticket.status === 'Draft' &&
      (this.draftSubject !== detail.ticket.subject || this.draftDescription !== detail.description || this.draftCategory !== (detail.ticket.categoryId ?? ''));
  }
  hasUnsavedChanges() {
    return !!this.body || this.triageChanged() || this.draftChanged();
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
      this.changed.emit();
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
        id: this.id(),
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
    if (this.draft) void this.mutate('support/update', this.draft, () => this.manageOpen.set(false));
  }
  saveDraft(submit = false) {
    const ticket = this.data.value()?.ticket;
    if (!ticket || ticket.status !== 'Draft') return;
    void this.mutate('support/update', {
      id: ticket.id,
      status: submit ? 'Open' : 'Draft',
      priority: ticket.priority,
      categoryId: this.draftCategory || null,
      assigneeId: null,
      version: ticket.version,
      subject: this.draftSubject,
      description: this.draftDescription,
    });
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
}
