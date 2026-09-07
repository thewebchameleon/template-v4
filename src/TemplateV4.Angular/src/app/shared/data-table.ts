import { Component, input, output } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
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

@Component({
  selector: 'app-data-table',
  imports: [FlexRender, HlmButtonImports, HlmEmptyImports, HlmSpinnerImports, HlmTableImports],
  template: `
    <div
      class="relative -mx-(--card-spacing) min-h-24 w-[calc(100%+var(--card-spacing)+var(--card-spacing))] overflow-hidden border-y"
      [class.h-24]="loading()"
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
                            <span aria-hidden="true">{{ sortIndicator(header.column.id) }}</span>
                          </button>
                        } @else {
                          <ng-container
                            *flexRender="
                              header.column.columnDef.header;
                              props: header.getContext();
                              let headerContent
                            "
                          >
                            {{ headerContent }}
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
              <tr hlmTr>
                @for (cell of row.getAllCells(); track cell.id) {
                  <td
                    hlmTd
                    class="first:ps-(--card-spacing) last:pe-(--card-spacing)"
                    [class.w-full]="cell.column.id === fillColumn()"
                  >
                    <ng-container
                      *flexRender="
                        cell.column.columnDef.cell;
                        props: cell.getContext();
                        let cellContent
                      "
                    >
                      {{ cellContent }}
                    </ng-container>
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
                  <div hlmEmpty role="status">
                    <div hlmEmptyHeader>
                      <p hlmEmptyTitle>{{ emptyText() }}</p>
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

  protected sortIndicator(column: string) {
    if (column !== this.sortColumn()) return '↕';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  protected toggleSort(column: string) {
    this.sortChange.emit({
      column,
      direction: column === this.sortColumn() && this.sortDirection() === 'asc' ? 'desc' : 'asc',
    });
  }
}
