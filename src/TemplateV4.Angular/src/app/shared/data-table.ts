import { Component, input, output, type TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideChevronsUpDown, lucideChevronUp } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmContextMenuImports } from '@spartan-ng/helm/context-menu';
import {
  type ColumnDef,
  FlexRender,
  injectTable,
  rowSortingFeature,
  type RowData,
  tableFeatures,
} from '@tanstack/angular-table';

export const dataTableFeatures = tableFeatures({ rowSortingFeature });
export type DataTableFeatures = typeof dataTableFeatures;
export type SortDirection = 'asc' | 'desc';
export interface ServerSort {
  column: string;
  direction: SortDirection;
}
export interface DataTableRowDragEvent<TData> {
  event: DragEvent;
  row: TData;
}

@Component({
  selector: 'app-data-table',
  imports: [
    FlexRender,
    NgTemplateOutlet,
    RouterLink,
    NgIcon,
    HlmButtonImports,
    HlmEmptyImports,
    HlmSpinnerImports,
    HlmTableImports,
    HlmContextMenuImports,
  ],
  providers: [provideIcons({ lucideChevronDown, lucideChevronsUpDown, lucideChevronUp })],
  template: `
    <div
      class="relative -mx-(--card-spacing) w-[calc(100%+var(--card-spacing)+var(--card-spacing))] overflow-hidden rounded-t-[var(--data-table-top-radius,0px)] border-y"
      [class.min-h-24]="loading()"
    >
      <div hlmTableContainer [class.blur-sm]="loading()" [attr.inert]="loading() ? '' : null">
        <table hlmTable [attr.aria-busy]="loading()" [attr.aria-label]="ariaLabel() || null">
          @if (!hideHeader()) {
            <thead hlmTHead>
              @for (headerGroup of table.getHeaderGroups(); track headerGroup.id) {
                <tr hlmTr>
                  @for (header of headerGroup.headers; track header.id) {
                    <th
                      hlmTh
                      class="first:ps-(--card-spacing) last:pe-(--card-spacing)"
                      [class.w-full]="header.column.id === fillColumn()"
                      [class.w-px]="header.column.id === 'selection'"
                      [class.whitespace-nowrap]="header.column.id === 'selection'"
                      [attr.colspan]="header.colSpan"
                      [attr.aria-sort]="ariaSort(header.column.id)"
                    >
                      @if (!header.isPlaceholder) {
                        @if (header.column.getCanSort()) {
                          <button
                            hlmBtn
                            type="button"
                            variant="ghost"
                            size="sm"
                            class="-ms-[calc(var(--spacing)*2.5+1px)]"
                            (click)="toggleSort(header.column.id)"
                          >
                            <ng-container
                              *flexRender="
                                header.column.columnDef.header;
                                props: header.getContext();
                                let headerContent
                              "
                            >
                              {{ headerContent }}
                            </ng-container>
                            <ng-icon [name]="sortIcon(header.column.id)" aria-hidden="true" />
                          </button>
                        } @else {
                          <ng-container
                            *flexRender="
                              header.column.columnDef.header;
                              props: header.getContext();
                              let headerContent
                            "
                          >
                            <span
                              [class.sr-only]="
                                header.column.id === 'actions' || header.column.id === 'selection'
                              "
                            >
                              {{ headerContent }}
                            </span>
                          </ng-container>
                        }
                      }
                    </th>
                  }
                </tr>
              }
            </thead>
          }
          <tbody hlmTBody>
            @for (row of table.getRowModel().rows; track row.id) {
              <tr
                hlmTr
                [class.cursor-pointer]="!!rowActionLabel()"
                [hlmContextMenuTrigger]="rowContextMenu() ?? null"
                [hlmContextMenuTriggerData]="{ file: row.original }"
                [disabled]="
                  loading() || !rowContextMenu() || !!rowContextMenuDisabled()?.(row.original)
                "
                [attr.draggable]="rowDraggable()?.(row.original) ? 'true' : null"
                [class.opacity-50]="rowDragging()?.(row.original)"
                [class.file-storage-drop-target]="rowDropActive()?.(row.original)"
                (click)="activateRow($event, row.original)"
                (dblclick)="activateRowDouble($event, row.original)"
                (keydown)="rowKeydown($event, row.original)"
                (dragstart)="rowDragStart.emit({ event: $event, row: row.original })"
                (dragend)="rowDragEnd.emit({ event: $event, row: row.original })"
                (dragover)="rowDragOver.emit({ event: $event, row: row.original })"
                (dragleave)="rowDragLeave.emit({ event: $event, row: row.original })"
                (drop)="rowDrop.emit({ event: $event, row: row.original })"
              >
                @for (cell of row.getAllCells(); track cell.id) {
                  <td
                    hlmTd
                    class="first:ps-(--card-spacing) last:pe-(--card-spacing)"
                    [class.w-full]="cell.column.id === fillColumn()"
                    [class.w-px]="cell.column.id === 'selection'"
                    [class.whitespace-nowrap]="cell.column.id === 'selection'"
                    [class.cursor-pointer]="
                      cell.column.id === 'selection' && !!rowSelectionActionLabel()
                    "
                    [class.text-end]="cell.column.id === 'actions'"
                    (click)="activateSelectionCell($event, row.original, cell.column.id)"
                  >
                    <ng-template #renderedCell
                      ><ng-container
                        *flexRender="
                          cell.column.columnDef.cell;
                          props: cell.getContext();
                          let cellContent
                        "
                      >
                        {{ cellContent }}
                      </ng-container></ng-template
                    >
                    @if (
                      rowActionLabel() &&
                      cell.column.id === (fillColumn() || row.getAllCells()[0]?.column.id)
                    ) {
                      @if (rowActionLink(); as link) {
                        <a
                          hlmBtn
                          variant="link"
                          class="h-auto whitespace-normal p-0 text-start"
                          data-row-action
                          [routerLink]="link(row.original)"
                          [attr.aria-label]="rowActionLabel()?.(row.original)"
                        >
                          <ng-container [ngTemplateOutlet]="renderedCell" />
                        </a>
                      } @else {
                        <button
                          hlmBtn
                          type="button"
                          variant="link"
                          class="h-auto whitespace-normal p-0 text-start"
                          data-row-action
                          aria-haspopup="dialog"
                          [attr.aria-label]="
                            rowDoubleActionLabel()?.(row.original) ?? rowActionLabel()?.(row.original)
                          "
                          (click)="activateRowAction($event, row.original)"
                        >
                          <ng-container [ngTemplateOutlet]="renderedCell" />
                        </button>
                      }
                    } @else {
                      <ng-container [ngTemplateOutlet]="renderedCell" />
                    }
                  </td>
                }
              </tr>
            } @empty {
              <tr hlmTr>
                <td
                  hlmTd
                  class="h-14 ps-(--card-spacing) pe-(--card-spacing) text-center"
                  [attr.colspan]="columns().length"
                >
                  <div hlmEmpty variant="compact" role="status">
                    <div hlmEmptyHeader variant="compact">
                      <p hlmEmptyTitle variant="compact">{{ emptyText() }}</p>
                    </div>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      @if (loading()) {
        <div class="absolute inset-0 flex items-center justify-center bg-background/30">
          <hlm-spinner [aria-label]="loadingText()" />
        </div>
      }
    </div>
  `,
})
export class DataTable<TData extends RowData> {
  readonly columns = input.required<ColumnDef<DataTableFeatures, TData>[]>();
  readonly data = input.required<TData[]>();
  readonly emptyText = input.required<string>();
  readonly loading = input(false);
  readonly loadingText = input('Loading…');
  readonly fillColumn = input<string>();
  readonly hideHeader = input(false);
  readonly ariaLabel = input('');
  readonly getRowId = input<(row: TData, index: number) => string>();
  readonly sortColumn = input.required<string>();
  readonly sortDirection = input.required<SortDirection>();
  readonly sortChange = output<ServerSort>();
  readonly rowActionLabel = input<(row: TData) => string>();
  readonly rowActionLink = input<(row: TData) => string>();
  readonly rowDoubleActionLabel = input<(row: TData) => string>();
  readonly rowSelectionActionLabel = input<(row: TData) => string>();
  readonly rowContextMenu = input<TemplateRef<unknown>>();
  readonly rowContextMenuDisabled = input<(row: TData) => boolean>();
  readonly rowAction = output<TData>();
  readonly rowDoubleAction = output<TData>();
  readonly rowSelectionAction = output<TData>();
  readonly rowDraggable = input<(row: TData) => boolean>();
  readonly rowDragging = input<(row: TData) => boolean>();
  readonly rowDropActive = input<(row: TData) => boolean>();
  readonly rowDragStart = output<DataTableRowDragEvent<TData>>();
  readonly rowDragEnd = output<DataTableRowDragEvent<TData>>();
  readonly rowDragOver = output<DataTableRowDragEvent<TData>>();
  readonly rowDragLeave = output<DataTableRowDragEvent<TData>>();
  readonly rowDrop = output<DataTableRowDragEvent<TData>>();

  protected activateRow(event: MouseEvent, row: TData) {
    if (
      !this.rowActionLabel() ||
      this.loading() ||
      event.button !== 0 ||
      event.detail > 1 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey ||
      window.getSelection()?.toString()
    )
      return;
    const target = event.target;
    if (
      !(target instanceof Element) ||
      target.closest('button, a, input, select, textarea, [role="button"], [role="checkbox"]')
    )
      return;
    (event.currentTarget as HTMLElement)
      .querySelector<HTMLElement>('[data-row-action]')
      ?.focus();
    this.rowAction.emit(row);
  }

  protected activateRowAction(event: MouseEvent, row: TData) {
    if (event.detail === 0 && this.rowDoubleActionLabel()) this.rowDoubleAction.emit(row);
    else if (event.detail < 2) this.rowAction.emit(row);
  }

  protected activateSelectionCell(event: MouseEvent, row: TData, column: string) {
    if (column !== 'selection' || !this.rowSelectionActionLabel() || this.loading()) return;
    const target = event.target;
    if (
      !(target instanceof Element) ||
      target.closest('button, a, input, select, textarea, [role="button"], [role="checkbox"]')
    )
      return;
    event.stopPropagation();
    this.rowSelectionAction.emit(row);
  }

  protected rowKeydown(event: KeyboardEvent, row: TData) {
    if (event.target !== event.currentTarget || !this.rowActionLabel() || this.loading()) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.rowAction.emit(row);
    }
  }

  protected activateRowDouble(event: MouseEvent, row: TData) {
    if (!this.rowDoubleActionLabel() || this.loading() || event.button !== 0) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const control = target.closest(
      'button, a, input, select, textarea, [role="button"], [role="checkbox"]',
    );
    if (control && !control.hasAttribute('data-row-action')) return;
    this.rowDoubleAction.emit(row);
  }

  protected readonly table = injectTable(() => ({
    features: dataTableFeatures,
    columns: this.columns(),
    data: this.data(),
    manualSorting: true,
    getRowId:
      this.getRowId() ??
      ((row: TData, index: number) => String((row as { id?: string }).id ?? index)),
  }));

  protected ariaSort(column: string) {
    return column === this.sortColumn()
      ? this.sortDirection() === 'asc'
        ? 'ascending'
        : 'descending'
      : null;
  }

  protected sortIcon(column: string) {
    if (column !== this.sortColumn()) return 'lucideChevronsUpDown';
    return this.sortDirection() === 'asc' ? 'lucideChevronUp' : 'lucideChevronDown';
  }

  protected toggleSort(column: string) {
    this.sortChange.emit({
      column,
      direction: column === this.sortColumn() && this.sortDirection() === 'asc' ? 'desc' : 'asc',
    });
  }
}
