import { Component, effect, inject, input, model, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime } from 'rxjs';
import { WorkspaceUi, Resource } from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import { WorkspaceApi } from '../../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import {
  ContentItem,
  ContentItemSummary,
  FileItem,
  FilePage,
  PageOfContentItemSummary,
} from '../../../../../src/TemplateV4.Angular/src/app/api/models';

@Component({
  selector: 'app-content-picker',
  imports: [WorkspaceUi],
  template: `<div class="grid gap-2">
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-sm">{{ selectedLabel() || value() || ('cmsChooseItem' | t) }}</span>
      <button
        hlmBtn
        variant="outline"
        type="button"
        (click)="open.set(!open())"
        [disabled]="disabled()"
      >
        {{ 'cmsChooseItem' | t }}
      </button>
      @if (value()) {
        <button hlmBtn variant="ghost" type="button" (click)="select(null)" [disabled]="disabled()">
          {{ 'cmsClear' | t }}
        </button>
      }
    </div>
    @if (open()) {
      <section class="grid gap-2 rounded-md border p-3" [attr.aria-label]="label()">
        <div hlmField>
          <label hlmFieldLabel [for]="controlId() + '-search'">{{ 'search' | t }}</label
          ><input
            hlmInput
            [id]="controlId() + '-search'"
            [ngModel]="search"
            (ngModelChange)="changeSearch($event)"
            [ngModelOptions]="{ standalone: true }"
          />
        </div>
        @if (parent()) {
          <button hlmBtn variant="ghost" type="button" (click)="parent.set(''); load()">
            {{ 'cmsFileRoot' | t }}
          </button>
        }
        <app-page-state [state]="data.state()" (retry)="load()" skeleton="empty">
          @for (item of data.value()?.items; track item.id) {
            <button
              hlmBtn
              variant="ghost"
              type="button"
              class="w-full justify-start"
              (click)="choose(item)"
            >
              {{ item.folder ? '▸ ' : '' }}{{ item.label }}
            </button>
          }
          <app-list-pager
            [total]="data.value()?.total ?? 0"
            [page]="page"
            [size]="10"
            (pageChange)="page = $event; load()"
          />
        </app-page-state>
      </section>
    }
  </div>`,
})
export class ContentPicker {
  readonly collection = input<string | null>(null);
  readonly images = input(false);
  readonly label = input('');
  readonly controlId = input.required<string>();
  readonly disabled = input(false);
  readonly value = model<string | null>(null);
  readonly open = signal(false);
  readonly parent = signal('');
  readonly selectedLabel = signal('');
  private readonly api = inject(WorkspaceApi);
  private readonly searches = new Subject<void>();
  readonly data = new Resource<{
    items: { id: string; label: string; folder: boolean }[];
    total: number;
  }>();
  search = '';
  page = 1;
  constructor() {
    this.searches.pipe(debounceTime(300), takeUntilDestroyed()).subscribe(() => {
      this.page = 1;
      void this.load();
    });
    effect(() => {
      if (this.open())
        untracked(() => {
          void this.load();
        });
    });
    effect(() => {
      const id = this.value();
      const collection = this.collection();
      if (id && collection)
        void this.api
          .get<ContentItem>('cms/collections/' + collection + '/items/' + id)
          .then((item) => this.selectedLabel.set(item.title))
          .catch(() => this.selectedLabel.set(id));
    });
  }
  changeSearch(value: string) {
    this.search = value;
    this.searches.next();
  }
  select(value: string | null) {
    this.value.set(value);
    if (!value) this.selectedLabel.set('');
    this.open.set(false);
  }
  choose(item: { id: string; label: string; folder: boolean }) {
    if (item.folder) {
      this.parent.set(item.id);
      this.page = 1;
      void this.load();
    } else {
      this.selectedLabel.set(item.label);
      this.select(item.id);
    }
  }
  load() {
    return this.data.load(async (signal) => {
      if (this.collection()) {
        const page = await this.api.get<PageOfContentItemSummary>(
          'cms/collections/' + this.collection() + '/items',
          { search: this.search, pageNumber: this.page, pageSize: 10 },
          signal,
        );
        return {
          items: page.items.map((x: ContentItemSummary) => ({
            id: x.id,
            label: x.title,
            folder: false,
          })),
          total: page.total,
        };
      }
      const page = await this.api.get<FilePage>(
        'file-storage',
        {
          search: this.search,
          pageNumber: this.page,
          pageSize: 10,
          ...(this.parent() ? { parentId: this.parent() } : {}),
        },
        signal,
      );
      return {
        items: page.page.items
          .filter(
            (x: FileItem) => x.isFolder || !this.images() || x.contentType.startsWith('image/'),
          )
          .map((x: FileItem) => ({ id: x.id, label: x.name, folder: x.isFolder })),
        total: page.page.total,
      };
    });
  }
}
