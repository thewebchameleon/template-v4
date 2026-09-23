import { Component, forwardRef, input, model } from '@angular/core';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { WorkspaceUi } from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import { BusinessDate } from '../../../../../src/TemplateV4.Angular/src/app/shared/business-date';
import { ContentField } from '../../../../../src/TemplateV4.Angular/src/app/api/models';
import { CmsMarkdownEditor } from '../articles/cms-markdown-editor';
import { ContentPicker } from './content-picker';

export type ContentValues = Record<string, unknown>;
@Component({
  selector: 'app-content-fields',
  imports: [
    WorkspaceUi,
    HlmSelectImports,
    BusinessDate,
    CmsMarkdownEditor,
    ContentPicker,
    forwardRef(() => ContentFields),
  ],
  template: `<div class="grid gap-5">
    @for (field of fields(); track field.key) {
      <fieldset hlmFieldSet [disabled]="disabled()" class="min-w-0">
        <legend hlmFieldLegend>{{ field.label }}{{ field.required ? ' *' : '' }}</legend>
        @for (entry of entries(field); track $index; let i = $index) {
          <div class="grid min-w-0 gap-3" [class.mb-4]="field.multiple">
            @switch (field.type) {
              @case ('group') {
                <app-content-fields
                  [fields]="field.fields ?? []"
                  [values]="object(entry)"
                  (valuesChange)="set(field, i, $event)"
                  [prefix]="id(field, i)"
                  [disabled]="disabled()"
                />
              }
              @case ('reference') {
                <app-content-picker
                  [collection]="field.collection ?? null"
                  [value]="string(object(entry)['id']) || null"
                  (valueChange)="reference(field, i, entry, $event)"
                  [controlId]="id(field, i)"
                  [label]="field.label"
                  [disabled]="disabled()"
                />
                <app-content-fields
                  [fields]="field.fields ?? []"
                  [values]="object(entry)"
                  (valuesChange)="set(field, i, $event)"
                  [prefix]="id(field, i)"
                  [disabled]="disabled()"
                />
              }
              @case ('file') {
                <app-content-picker
                  [value]="string(entry) || null"
                  (valueChange)="set(field, i, $event)"
                  [controlId]="id(field, i)"
                  [label]="field.label"
                  [disabled]="disabled()"
                />
              }
              @case ('image') {
                <app-content-picker
                  [images]="true"
                  [value]="string(entry) || null"
                  (valueChange)="set(field, i, $event)"
                  [controlId]="id(field, i)"
                  [label]="field.label"
                  [disabled]="disabled()"
                />
              }
              @case ('richText') {
                <div hlmField>
                  <label hlmFieldLabel [for]="id(field, i)" class="sr-only">{{ field.label }}</label
                  ><app-cms-markdown-editor
                    [inputId]="id(field, i)"
                    [ngModel]="string(entry)"
                    (ngModelChange)="set(field, i, $event)"
                    [ngModelOptions]="{ standalone: true }"
                    [disabled]="disabled()"
                  />
                </div>
              }
              @case ('date') {
                <app-business-date
                  [controlId]="id(field, i)"
                  [label]="field.label"
                  [value]="string(entry) || null"
                  (valueChange)="set(field, i, $event)"
                />
              }
              @case ('boolean') {
                <label hlmFieldLabel [for]="id(field, i)" class="cursor-pointer"
                  ><div hlmField orientation="horizontal">
                    <hlm-checkbox
                      [inputId]="id(field, i)"
                      [checked]="entry === true"
                      (checkedChange)="set(field, i, $event === true)"
                      [disabled]="disabled()"
                    />{{ field.label }}
                  </div></label
                >
              }
              @case ('select') {
                <div hlmField>
                  <label hlmFieldLabel [for]="id(field, i)" class="sr-only">{{
                    field.label
                  }}</label>
                  <hlm-select
                    [value]="string(entry)"
                    (valueChange)="set(field, i, $event)"
                    [disabled]="disabled()"
                  >
                    <hlm-select-trigger [buttonId]="id(field, i)"
                      ><hlm-select-value /></hlm-select-trigger
                    ><hlm-select-content *hlmSelectPortal>
                      @for (option of field.options; track option) {
                        <hlm-select-item [value]="option">{{ option }}</hlm-select-item>
                      }
                    </hlm-select-content></hlm-select
                  >
                </div>
              }
              @default {
                <div hlmField>
                  <label hlmFieldLabel [for]="id(field, i)" class="sr-only">{{ field.label }}</label
                  ><input
                    hlmInput
                    [id]="id(field, i)"
                    [type]="field.type === 'number' ? 'number' : 'text'"
                    [ngModel]="entry"
                    (ngModelChange)="set(field, i, $event)"
                    [ngModelOptions]="{ standalone: true }"
                    [required]="!!field.required"
                  />
                </div>
              }
            }
            @if (field.multiple) {
              <div class="flex gap-2">
                <button
                  hlmBtn
                  variant="ghost"
                  type="button"
                  (click)="remove(field, i)"
                  [disabled]="disabled()"
                >
                  {{ 'cmsRemoveItem' | t }}
                </button>
                <button
                  hlmBtn
                  variant="ghost"
                  type="button"
                  (click)="move(field, i, -1)"
                  [disabled]="disabled() || i === 0"
                >
                  {{ 'cmsMoveUp' | t }}
                </button>
                <button
                  hlmBtn
                  variant="ghost"
                  type="button"
                  (click)="move(field, i, 1)"
                  [disabled]="disabled() || i === entries(field).length - 1"
                >
                  {{ 'cmsMoveDown' | t }}
                </button>
              </div>
            }
          </div>
        }
        @if (field.multiple) {
          <button
            hlmBtn
            variant="outline"
            type="button"
            (click)="add(field)"
            [disabled]="disabled()"
          >
            {{ 'cmsAddItem' | t }}
          </button>
        }
      </fieldset>
    }
  </div>`,
})
export class ContentFields {
  readonly fields = input<ContentField[]>([]);
  readonly values = model<ContentValues>({});
  readonly disabled = input(false);
  readonly prefix = input('content');
  id(field: ContentField, index: number) {
    return this.prefix() + '-' + field.key + '-' + index;
  }
  object(value: unknown): ContentValues {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as ContentValues)
      : {};
  }
  string(value: unknown) {
    return typeof value === 'string' ? value : '';
  }
  entries(field: ContentField): unknown[] {
    const value = this.values()[field.key];
    return field.multiple ? (Array.isArray(value) ? value : []) : [value ?? this.initial(field)];
  }
  initial(field: ContentField): unknown {
    return ['reference', 'group'].includes(field.type)
      ? {}
      : field.type === 'boolean'
        ? false
        : null;
  }
  set(field: ContentField, index: number, value: unknown) {
    if (field.multiple) {
      const entries = [...this.entries(field)];
      entries[index] = value;
      this.values.update((v) => ({ ...v, [field.key]: entries }));
    } else this.values.update((v) => ({ ...v, [field.key]: value }));
  }
  reference(field: ContentField, index: number, value: unknown, id: string | null) {
    this.set(field, index, id ? { ...this.object(value), id } : null);
  }
  add(field: ContentField) {
    this.values.update((v) => ({
      ...v,
      [field.key]: [...this.entries(field), this.initial(field)],
    }));
  }
  remove(field: ContentField, index: number) {
    this.values.update((v) => ({
      ...v,
      [field.key]: this.entries(field).filter((_, i) => i !== index),
    }));
  }
  move(field: ContentField, index: number, direction: number) {
    const entries = [...this.entries(field)];
    [entries[index], entries[index + direction]] = [entries[index + direction], entries[index]];
    this.values.update((v) => ({ ...v, [field.key]: entries }));
  }
}
