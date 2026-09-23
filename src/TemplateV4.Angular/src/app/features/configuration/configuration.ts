import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
  ElementRef,
  Injector,
  afterNextRender,
} from '@angular/core';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';
import { provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { WorkspaceUi, Resource, Confirmations, protectUnload } from '../../shared/workspace';
import { WorkspaceApi } from '../../core/workspace-api';
import { Notifications } from '../notifications/notifications';
import { PlatformAppearance, CustomBrandColor } from '../../api/models';
import { CustomColorEditor } from '../../shared/custom-color-editor';
import { DEFAULT_PRIMARY_COLOR, validPrimaryColor } from '../../core/brand-palette';
import { PlatformAppearanceTheme } from '../../core/platform-appearance';
import { LoginBackgroundPicker } from '../../shared/login-background-picker';
import { DEFAULT_LOGIN_BACKGROUND, loginBackground } from '../../core/login-backgrounds';
import { OrganisationSettingsEditor } from '../organisations/organisation-settings-editor';

@Component({
  selector: 'app-configuration',
  imports: [
    WorkspaceUi,
    HlmToggleGroupImports,
    CustomColorEditor,
    LoginBackgroundPicker,
    OrganisationSettingsEditor,
  ],
  providers: [provideIcons({ lucidePencil, lucideTrash2 })],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: ` <app-page-header title="configuration" description="configurationHelp" />
    <div class="workspace-stack">
      <app-organisation-settings-editor />
      <app-page-state
        [state]="data.state()"
        skeleton="form-card"
        [refreshing]="data.refreshing()"
        [refreshError]="data.refreshError()"
        (retry)="reload()"
      >
        <form (ngSubmit)="save()">
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'platformAppearance' | t }}</h2>
              <p hlmCardDescription>{{ 'platformAppearanceHelp' | t }}</p>
            </div>
            <div hlmCardContent class="grid gap-6">
              <fieldset hlmFieldSet [disabled]="busy() || data.refreshing()">
                <legend hlmFieldLegend>{{ 'primaryColor' | t }}</legend>
                <hlm-toggle-group
                  type="single"
                  [value]="selectedId() ? '' : color().toUpperCase()"
                  [nullable]="false"
                  [disabled]="busy() || data.refreshing()"
                  (valueChange)="selectPreset($event)"
                  class="flex-wrap"
                  [spacing]="2"
                  [attr.aria-label]="'colorPresets' | t"
                >
                  @for (preset of presets; track preset.color) {
                    <button hlmToggleGroupItem type="button" [value]="preset.color">
                      <span
                        class="size-4 rounded-full border border-current"
                        [style.background-color]="preset.color"
                        aria-hidden="true"
                      ></span>
                      {{ preset.label | t }}
                    </button>
                  }
                </hlm-toggle-group>
              </fieldset>
              <section aria-labelledby="custom-colors-title" class="grid gap-3">
                <h3 id="custom-colors-title" class="font-semibold">{{ 'customColors' | t }}</h3>
                <p class="text-muted-foreground text-sm">{{ 'customColorsHelp' | t }}</p>
                <div
                  class="flex flex-wrap items-center gap-3"
                  role="group"
                  [attr.aria-label]="'customColors' | t"
                >
                  @for (item of customColors(); track item.id) {
                    <div
                      class="flex max-w-full flex-wrap items-center gap-2 rounded-md border border-border p-2"
                    >
                      <button
                        hlmBtn
                        type="button"
                        [variant]="selectedId() === item.id ? 'default' : 'outline'"
                        [disabled]="busy() || data.refreshing()"
                        [attr.aria-pressed]="selectedId() === item.id"
                        (click)="selectCustom(item)"
                        [title]="item.name"
                      >
                        <span
                          class="size-4 shrink-0 rounded-full border border-current"
                          [style.background-color]="item.color"
                          aria-hidden="true"
                        ></span>
                        <span class="max-w-40 truncate">{{ item.name }}</span>
                      </button>
                      <app-custom-color-editor
                        [item]="item"
                        [usedNames]="otherNames(item.id)"
                        [disabled]="busy() || data.refreshing()"
                        (changed)="upsertCustom($event, item.id)"
                        (preview)="preview($event)"
                      />
                      <button
                        hlmBtn
                        variant="destructive"
                        size="icon-sm"
                        type="button"
                        [disabled]="busy() || data.refreshing()"
                        [attr.aria-label]="('removeCustomColor' | t) + ': ' + item.name"
                        [title]="('removeCustomColor' | t) + ': ' + item.name"
                        (click)="removeCustom(item.id)"
                      >
                        <ng-icon name="lucideTrash2" aria-hidden="true" />
                      </button>
                    </div>
                  }
                  <app-custom-color-editor
                    #addColor
                    [initialColor]="color()"
                    [usedNames]="otherNames()"
                    [disabled]="busy() || data.refreshing() || customColors().length >= 24"
                    (changed)="upsertCustom($event)"
                    (preview)="preview($event)"
                  />
                </div>
                @if (!customColors().length) {
                  <p class="text-muted-foreground text-sm">{{ 'noCustomColors' | t }}</p>
                }
                <p role="status" aria-live="polite" class="text-sm">{{ removalNotice() | t }}</p>
              </section>
              <app-login-background-picker
                [(value)]="background"
                [disabled]="busy() || data.refreshing()"
              />
            </div>
            <div hlmCardFooter class="flex-wrap gap-2">
              <button
                hlmBtn
                type="submit"
                [disabled]="busy() || data.refreshing() || !valid() || !hasUnsavedChanges()"
              >
                @if (busy()) {
                  <hlm-spinner />
                }
                {{ 'save' | t }}
              </button>
              @if (hasUnsavedChanges()) {
                <button
                  hlmBtn
                  variant="destructive"
                  type="button"
                  [disabled]="busy() || data.refreshing()"
                  (click)="reload()"
                >
                  {{ 'undoChanges' | t }}
                </button>
              }
            </div>
          </section>
        </form>
      </app-page-state>
    </div>`,
})
export class ConfigurationPage implements OnInit, OnDestroy {
  private readonly api = inject(WorkspaceApi);
  private readonly appearance = inject(PlatformAppearanceTheme);
  private readonly toast = inject(Notifications);
  private readonly confirm = inject(Confirmations);
  private readonly injector = inject(Injector);
  private readonly addColor = viewChild<unknown, ElementRef<HTMLElement>>('addColor', {
    read: ElementRef,
  });
  private readonly organisation = viewChild(OrganisationSettingsEditor);
  private savedColor: string | null = null;
  readonly data = new Resource<PlatformAppearance>();
  readonly busy = signal(false);
  readonly color = signal(DEFAULT_PRIMARY_COLOR);
  readonly background = signal<string>(DEFAULT_LOGIN_BACKGROUND);
  readonly customColors = signal<CustomBrandColor[]>([]);
  readonly selectedId = signal<string | null>(null);
  readonly previewColor = signal<string | null>(null);
  readonly removalNotice = signal('');
  readonly defaultColor = DEFAULT_PRIMARY_COLOR;
  readonly valid = computed(() => validPrimaryColor(this.color()));
  readonly presets = [
    { color: '#2563EB', label: 'colorBlue' },
    { color: '#7C3AED', label: 'colorViolet' },
    { color: '#C026D3', label: 'colorMagenta' },
    { color: '#EA580C', label: 'colorOrange' },
    { color: '#059669', label: 'colorEmerald' },
    { color: '#0891B2', label: 'colorCyan' },
    { color: '#65A30D', label: 'colorLime' },
    { color: '#EAB308', label: 'colorYellow' },
    { color: '#DC2626', label: 'colorRed' },
  ];
  ngOnInit() {
    void this.load();
  }
  ngOnDestroy() {
    if (this.savedColor) this.appearance.apply(this.savedColor);
  }
  selectPreset(value: unknown) {
    if (typeof value === 'string' && validPrimaryColor(value)) {
      this.color.set(value);
      this.selectedId.set(null);
      this.appearance.apply(value);
    }
  }
  selectCustom(item: CustomBrandColor) {
    this.color.set(item.color);
    this.selectedId.set(item.id);
    this.appearance.apply(item.color);
  }
  preview(value: string | null) {
    this.previewColor.set(value);
    this.appearance.apply(value ?? this.color());
  }
  otherNames(except?: string) {
    return this.customColors()
      .filter((item) => item.id !== except)
      .map((item) => item.name);
  }
  upsertCustom(value: { name: string; color: string }, id?: string) {
    if (this.busy() || this.data.refreshing() || (!id && this.customColors().length >= 24)) return;
    const item = { ...value, id: id ?? crypto.randomUUID() };
    this.customColors.update((items) =>
      id ? items.map((existing) => (existing.id === id ? item : existing)) : [...items, item],
    );
    this.selectCustom(item);
    this.removalNotice.set('');
  }
  async removeCustom(id: string) {
    if (this.busy() || this.data.refreshing()) return;
    const item = this.customColors().find((color) => color.id === id);
    if (
      !item ||
      !(await this.confirm.ask(
        'removeCustomColorTitle',
        'removeCustomColorHelp',
        item.name,
        true,
        'removeCustomColor',
      ))
    )
      return;
    const active = this.selectedId() === id;
    this.customColors.update((items) => items.filter((item) => item.id !== id));
    if (active) this.selectPreset(this.defaultColor);
    this.removalNotice.set(active ? 'activeCustomColorRemoved' : 'customColorRemoved');
    afterNextRender(() => this.addColor()?.nativeElement.querySelector('button')?.focus(), {
      injector: this.injector,
    });
  }
  hasUnsavedChanges() {
    return (
      !!this.organisation()?.hasUnsavedChanges() ||
      (this.data.value() !== null &&
        (this.color().toUpperCase() !== this.data.value()!.primaryColor.toUpperCase() ||
          this.background() !== loginBackground(this.data.value()!.loginBackground).id ||
          this.selectedId() !== (this.data.value()!.selectedCustomColorId ?? null) ||
          JSON.stringify(this.customColors()) !==
            JSON.stringify(this.data.value()!.customColors ?? [])))
    );
  }
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
  private async load() {
    const loaded = await this.data.load((signal) =>
      this.api.get('configuration/appearance', {}, signal),
    );
    if (loaded) {
      this.accept(this.data.value()!);
      this.removalNotice.set('');
    }
    return loaded;
  }
  private accept(value: PlatformAppearance) {
    this.background.set(loginBackground(value.loginBackground).id);
    this.appearance.loginBackground.set(this.background());
    this.savedColor = value.primaryColor;
    this.color.set(value.primaryColor);
    this.customColors.set(value.customColors ?? []);
    this.selectedId.set(value.selectedCustomColorId ?? null);
    this.appearance.apply(value.primaryColor);
  }
  async reload() {
    if (this.busy() || this.data.refreshing()) return;
    if (
      !this.hasUnsavedChanges() ||
      (await this.confirm.ask('undoChangesTitle', 'undoChangesHelp', '', true, 'undoChanges'))
    )
      await this.load();
  }
  async save() {
    if (this.busy() || this.data.refreshing() || !this.valid() || !this.hasUnsavedChanges()) return;
    this.busy.set(true);
    try {
      const saved = await this.api.post<PlatformAppearance>('configuration/appearance', {
        primaryColor: this.color().toUpperCase(),
        version: this.data.value()!.version,
        customColors: this.customColors(),
        selectedCustomColorId: this.selectedId(),
        loginBackground: this.background(),
      });
      this.data.value.set(saved);
      this.accept(saved);
      this.toast.success('appearanceSaved');
    } catch {
      /* Central errors retain the draft, including stale-version conflicts. */
    } finally {
      this.busy.set(false);
    }
  }
}
