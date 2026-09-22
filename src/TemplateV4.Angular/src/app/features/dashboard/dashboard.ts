import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { provideIcons } from '@ng-icons/core';
import {
  lucideGripHorizontal,
  lucideLock,
  lucidePencil,
  lucideRefreshCw,
  lucideTrash2,
  lucideUnlock,
} from '@ng-icons/lucide';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { WorkspaceUi, Confirmations, protectUnload } from '../../shared/workspace';
import { WorkspaceApi } from '../../core/workspace-api';
import { I18n } from '../../core/i18n';
import {
  DashboardCard,
  DashboardCardDefinition,
  DashboardDto,
  DashboardLayout,
  DashboardState,
} from '../../api/models';
import { DashboardChoice } from './dashboard-choice';
import { DashboardCardView } from './dashboard-card';
import { DashboardMasonryItem } from './dashboard-masonry-item';

@Component({
  selector: 'app-dashboard',
  imports: [
    WorkspaceUi,
    DragDropModule,
    HlmAlertDialogImports,
    HlmDialogImports,
    HlmDrawerImports,
    DashboardChoice,
    DashboardCardView,
    DashboardMasonryItem,
  ],
  providers: [
    provideIcons({
      lucideGripHorizontal,
      lucideLock,
      lucidePencil,
      lucideRefreshCw,
      lucideTrash2,
      lucideUnlock,
    }),
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardPage {
  private readonly api = inject(WorkspaceApi);
  private readonly confirmations = inject(Confirmations);
  readonly i18n = inject(I18n);
  readonly state = signal<DashboardState | null>(null);
  readonly selected = signal('');
  readonly draft = signal<DashboardLayout | null>(null);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly period = signal('all');
  readonly refresh = signal(0);
  readonly picker = signal(false);
  readonly search = signal('');
  readonly hidden = signal<string[]>([]);
  readonly sharedEdit = signal(false);
  readonly renameOpen = signal(false);
  readonly renameValue = signal('');
  readonly lockPrompt = signal(false);
  readonly editingCardId = signal('');
  private base: DashboardDto | null = null;
  readonly periods = [
    { value: 'all', label: 'dashAllTime' },
    { value: '7', label: 'dash7Days' },
    { value: '30', label: 'dash30Days' },
    { value: '90', label: 'dash90Days' },
  ];
  readonly cardPeriods = [{ value: 'inherit', label: 'dashUseDashboard' }, ...this.periods];
  readonly current = computed(
    () => this.state()?.dashboards.find((x) => x.id === this.selected()) ?? null,
  );
  readonly layout = computed(() => this.draft() ?? this.current()?.layout ?? null);
  readonly dashboardOptions = computed(
    () => this.state()?.dashboards.map((x) => ({ value: x.id, label: x.layout.name })) ?? [],
  );
  readonly catalog = computed(
    () => this.state()?.catalog.filter((x) => !this.hidden().includes(x.id)) ?? [],
  );
  readonly definitions = computed(() => new Map(this.catalog().map((x) => [x.id, x])));
  readonly visible = computed(
    () => this.layout()?.cards.filter((x) => this.definitions().has(x.definitionId)) ?? [],
  );
  readonly results = computed(() =>
    this.catalog().filter((x) =>
      `${this.i18n.text(x.title)} ${x.module}`
        .toLocaleLowerCase()
        .includes(this.search().toLocaleLowerCase()),
    ),
  );
  readonly unavailableCount = computed(
    () => (this.layout()?.cards.length ?? 0) - this.visible().length,
  );
  readonly editingCard = computed(
    () => this.draft()?.cards.find((x) => x.id === this.editingCardId()) ?? null,
  );
  readonly editingDefinition = computed(() => {
    const card = this.editingCard();
    return card ? (this.definitions().get(card.definitionId) ?? null) : null;
  });
  readonly dirty = computed(() => {
    const draft = this.draft();
    return (
      draft !== null && (!this.base || JSON.stringify(draft) !== JSON.stringify(this.base.layout))
    );
  });
  constructor() {
    void this.load();
  }
  @HostListener('window:beforeunload', ['$event']) beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
  hasUnsavedChanges() {
    return this.dirty();
  }
  private async run(work: () => Promise<void>) {
    this.busy.set(true);
    this.error.set('');
    this.notice.set('');
    try {
      await work();
    } catch (error: unknown) {
      this.error.set(
        error instanceof HttpErrorResponse && error.status === 409
          ? 'dashConflict'
          : 'dashSaveFailed',
      );
    } finally {
      this.busy.set(false);
    }
  }
  async load(id = this.selected()) {
    await this.run(async () => {
      const state = await this.api.get<DashboardState>('dashboards');
      this.state.set(state);
      this.hidden.set([]);
      const starting =
        state.startingDashboardId ??
        state.dashboards.find((x) => x.id === 'd4500000-0000-0000-0000-000000000001')?.id ??
        state.dashboards[0]?.id ??
        '';
      this.select(state.dashboards.some((x) => x.id === id) ? id : starting);
      if (!this.current() && state.dashboards.length) this.select(state.dashboards[0].id);
      this.refresh.update((x) => x + 1);
    });
  }
  select(id: string) {
    this.selected.set(id);
    this.period.set(this.current()?.layout.period ?? 'all');
  }
  edit(shared = false) {
    this.base = shared
      ? (this.state()?.defaults.find((x) => x.id === this.selected()) ?? null)
      : this.current();
    if (!this.base) return;
    this.sharedEdit.set(shared);
    this.draft.set(structuredClone(this.base.layout));
    this.period.set(this.base.layout.period);
    this.error.set('');
  }
  create(shared: boolean) {
    this.base = null;
    this.sharedEdit.set(shared);
    this.draft.set({ name: this.i18n.text('dashUntitled'), period: 'all', cards: [] });
    this.period.set('all');
    this.picker.set(true);
    this.error.set('');
  }
  cancel() {
    this.draft.set(null);
    this.picker.set(false);
    this.renameOpen.set(false);
    this.lockPrompt.set(false);
    this.editingCardId.set('');
    this.period.set(this.current()?.layout.period ?? 'all');
    this.error.set('');
  }
  name(value: string) {
    this.draft.update((x) => (x ? { ...x, name: value } : x));
  }
  setPeriod(value: string) {
    this.period.set(value);
    this.draft.update((x) => (x ? { ...x, period: value } : x));
  }
  async save() {
    const layout = this.draft();
    if (!layout) return;
    let savedId = '';
    await this.run(async () => {
      const saved = await this.api.post<DashboardDto>('dashboards/save', {
        id: this.base?.id ?? null,
        version: this.base?.version ?? null,
        shared: this.sharedEdit(),
        layout,
      });
      savedId = saved.id;
      this.draft.set(null);
      this.picker.set(false);
      this.renameOpen.set(false);
      this.editingCardId.set('');
    });
    if (savedId) {
      await this.load(savedId);
      this.notice.set('dashSaved');
    }
  }
  requestLock() {
    if (!this.draft()) return;
    if (!this.dirty()) {
      this.cancel();
      return;
    }
    this.lockPrompt.set(true);
  }
  saveAndLock() {
    this.lockPrompt.set(false);
    void this.save();
  }
  discardAndLock() {
    this.lockPrompt.set(false);
    this.cancel();
  }
  openRename() {
    const layout = this.draft();
    if (!layout) return;
    this.renameValue.set(this.i18n.text(layout.name));
    this.renameOpen.set(true);
  }
  applyRename() {
    const value = this.renameValue().trim();
    if (!value) return;
    this.name(value);
    this.renameOpen.set(false);
  }
  openCardEditor(id: string) {
    this.editingCardId.set(id);
  }
  async starting() {
    await this.run(async () => {
      await this.api.post('dashboards/starting', { id: this.selected() });
      this.state.update((x) => (x ? { ...x, startingDashboardId: this.selected() } : x));
      this.notice.set('dashStartingSaved');
    });
  }
  async reset() {
    const current = this.current();
    if (!current || !(await this.confirmations.ask('dashReset', 'dashResetHelp'))) return;
    let changed = false;
    await this.run(async () => {
      await this.api.post('dashboards/reset', { id: current.id, version: current.version });
      changed = true;
    });
    if (changed) await this.load();
  }
  async removeDashboard() {
    const current = this.current();
    if (!current) return;
    const source = current.shared
      ? this.state()?.defaults.find((x) => x.id === current.id)
      : current;
    if (
      !source ||
      !(await this.confirmations.ask(
        'dashDelete',
        current.shared ? 'dashDeleteSharedHelp' : 'dashDeleteHelp',
        this.i18n.text(current.layout.name),
        true,
        'delete',
      ))
    )
      return;
    let changed = false;
    await this.run(async () => {
      await this.api.post('dashboards/delete', {
        id: source.id,
        version: source.version,
        shared: source.shared,
      });
      changed = true;
    });
    if (changed) await this.load();
  }
  add(definition: DashboardCardDefinition) {
    this.draft.update((x) =>
      x
        ? {
            ...x,
            cards: [
              ...x.cards,
              {
                id: crypto.randomUUID(),
                definitionId: definition.id,
                size: definition.sizes.includes('small') ? 'small' : definition.sizes[0],
                format: definition.formats[0],
                metric: definition.metrics[0],
                filter: definition.filters[0],
                period: 'inherit',
              },
            ],
          }
        : x,
    );
    this.notice.set('dashCardAdded');
  }
  update(id: string, changes: Partial<DashboardCard>) {
    this.draft.update((x) =>
      x ? { ...x, cards: x.cards.map((c) => (c.id === id ? { ...c, ...changes } : c)) } : x,
    );
  }
  remove(id: string) {
    this.draft.update((x) => (x ? { ...x, cards: x.cards.filter((c) => c.id !== id) } : x));
    if (this.editingCardId() === id) this.editingCardId.set('');
  }
  move(id: string, delta: number) {
    const visible = this.visible();
    const index = visible.findIndex((x) => x.id === id);
    const target = visible[index + delta];
    if (target) this.reorder(id, target.id);
  }
  drop(event: CdkDragDrop<DashboardCard[]>) {
    const cards = this.visible();
    const from = cards[event.previousIndex];
    const to = cards[event.currentIndex];
    if (from && to) this.reorder(from.id, to.id);
  }
  private reorder(id: string, target: string) {
    this.draft.update((x) => {
      if (!x) return x;
      const cards = [...x.cards];
      const from = cards.findIndex((c) => c.id === id);
      const to = cards.findIndex((c) => c.id === target);
      cards.splice(to, 0, cards.splice(from, 1)[0]);
      return { ...x, cards };
    });
    this.notice.set('dashMoved');
  }
  hide(id: string) {
    this.hidden.update((x) => [...x, id]);
  }
  options(values: string[]) {
    return values.map((value) => ({ value, label: `dashOption_${value}` }));
  }
}
