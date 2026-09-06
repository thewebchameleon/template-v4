import { Component, input } from '@angular/core';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import {
  type ColumnDef,
  FlexRender,
  injectTable,
  type RowData,
  tableFeatures,
} from '@tanstack/angular-table';

export const dataTableFeatures = tableFeatures({});
export type DataTableFeatures = typeof dataTableFeatures;

@Component({
  selector: 'app-data-table',
  imports: [FlexRender, HlmEmptyImports, HlmSpinnerImports, HlmTableImports],
  template: `
    <div class="overflow-hidden rounded-md border">
      <div hlmTableContainer>
        <table hlmTable [attr.aria-busy]="loading()">
          <thead hlmTHead>
            @for (headerGroup of table.getHeaderGroups(); track headerGroup.id) {
              <tr hlmTr>
                @for (header of headerGroup.headers; track header.id) {
                  <th hlmTh [attr.colspan]="header.colSpan">
                    @if (!header.isPlaceholder) {
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
                  </th>
                }
              </tr>
            }
          </thead>
          <tbody hlmTBody>
            @for (row of table.getRowModel().rows; track row.id) {
              <tr hlmTr>
                @for (cell of row.getAllCells(); track cell.id) {
                  <td hlmTd>
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
                <td hlmTd class="h-24 text-center" [attr.colspan]="columns().length">
                  <div hlmEmpty role="status">
                    <div hlmEmptyHeader>
                      @if (loading()) {
                        <hlm-spinner />
                      }
                      <p hlmEmptyTitle>{{ loading() ? loadingText() : emptyText() }}</p>
                    </div>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class DataTable<TData extends RowData> {
  readonly columns = input.required<ColumnDef<DataTableFeatures, TData>[]>();
  readonly data = input.required<TData[]>();
  readonly emptyText = input.required<string>();
  readonly loading = input(false);
  readonly loadingText = input('Loading…');
  readonly getRowId = input<(row: TData, index: number) => string>();

  protected readonly table = injectTable(() => ({
    features: dataTableFeatures,
    columns: this.columns(),
    data: this.data(),
    getRowId: this.getRowId(),
  }));
}
