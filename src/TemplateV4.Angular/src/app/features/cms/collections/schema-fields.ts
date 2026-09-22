import { Component, forwardRef, input, model } from '@angular/core';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { WorkspaceUi } from '../../../shared/workspace';
import { ContentCollection, ContentField } from '../../../api/models';

@Component({
  selector: 'app-content-schema-fields',
  imports: [WorkspaceUi, HlmSelectImports, forwardRef(() => ContentSchemaFields)],
  template: `<div class="grid gap-4">
    @for (field of fields(); track $index; let i = $index) {
      <fieldset hlmFieldSet class="rounded-md border p-4" [disabled]="disabled()">
        <legend hlmFieldLegend>{{ field.label || ('cmsField' | t) }}</legend>
        <div class="grid gap-3 sm:grid-cols-2">
          <div hlmField>
            <label hlmFieldLabel [for]="prefix() + i + '-key'">{{ 'cmsKey' | t }}</label>
            <input
              hlmInput
              [id]="prefix() + i + '-key'"
              [ngModel]="field.key"
              (ngModelChange)="set(i, 'key', $event)"
              [ngModelOptions]="{ standalone: true }"
              [readonly]="locked(field.key)"
              required
              pattern="[a-z][a-zA-Z0-9_]{0,63}"
            />
          </div>
          <div hlmField>
            <label hlmFieldLabel [for]="prefix() + i + '-label'">{{ 'cmsLabel' | t }}</label>
            <input
              hlmInput
              [id]="prefix() + i + '-label'"
              [ngModel]="field.label"
              (ngModelChange)="set(i, 'label', $event)"
              [ngModelOptions]="{ standalone: true }"
              required
            />
          </div>
          <div hlmField>
            <label hlmFieldLabel [for]="prefix() + i + '-type'">{{ 'cmsFieldType' | t }}</label>
            <hlm-select
              [value]="field.type"
              (valueChange)="set(i, 'type', $event)"
              [disabled]="locked(field.key) || disabled()"
            >
              <hlm-select-trigger [buttonId]="prefix() + i + '-type'"
                ><hlm-select-value
              /></hlm-select-trigger>
              <hlm-select-content *hlmSelectPortal>
                @for (type of types; track type) {
                  <hlm-select-item [value]="type">{{ 'cmsType.' + type | t }}</hlm-select-item>
                }
              </hlm-select-content>
            </hlm-select>
          </div>
          <label hlmFieldLabel [for]="prefix() + i + '-required'" class="cursor-pointer"
            ><div hlmField orientation="horizontal">
              <hlm-checkbox
                [inputId]="prefix() + i + '-required'"
                [checked]="!!field.required"
                (checkedChange)="set(i, 'required', $event)"
                [disabled]="disabled()"
              />{{ 'cmsRequired' | t }}
            </div></label
          >
          <label hlmFieldLabel [for]="prefix() + i + '-multiple'" class="cursor-pointer"
            ><div hlmField orientation="horizontal">
              <hlm-checkbox
                [inputId]="prefix() + i + '-multiple'"
                [checked]="!!field.multiple"
                (checkedChange)="set(i, 'multiple', $event)"
                [disabled]="locked(field.key) || disabled()"
              />{{ 'cmsMultiple' | t }}
            </div></label
          >
          @if (field.type === 'select') {
            <div hlmField>
              <label hlmFieldLabel [for]="prefix() + i + '-options'">{{ 'cmsOptions' | t }}</label
              ><input
                hlmInput
                [id]="prefix() + i + '-options'"
                [ngModel]="field.options?.join(', ')"
                (ngModelChange)="options(i, $event)"
                [ngModelOptions]="{ standalone: true }"
              />
            </div>
          }
          @if (field.type === 'reference') {
            <div hlmField>
              <label hlmFieldLabel [for]="prefix() + i + '-target'">{{
                'cmsTargetCollection' | t
              }}</label>
              <hlm-select
                [value]="field.collection ?? ''"
                (valueChange)="set(i, 'collection', $event)"
                [disabled]="locked(field.key) || disabled()"
              >
                <hlm-select-trigger [buttonId]="prefix() + i + '-target'"
                  ><hlm-select-value
                /></hlm-select-trigger>
                <hlm-select-content *hlmSelectPortal>
                  @for (collection of collections(); track collection.key) {
                    <hlm-select-item [value]="collection.key">{{
                      collection.label
                    }}</hlm-select-item>
                  }
                </hlm-select-content>
              </hlm-select>
            </div>
          }
        </div>
        @if (field.type === 'group' || field.type === 'reference') {
          <div class="mt-4">
            <p class="mb-3 text-sm text-muted-foreground">{{ 'cmsNestedFields' | t }}</p>
            <app-content-schema-fields
              [fields]="field.fields ?? []"
              (fieldsChange)="set(i, 'fields', $event)"
              [collections]="collections()"
              [original]="originalField(field.key)?.fields ?? []"
              [prefix]="prefix() + i + '-'"
              [disabled]="disabled()"
            />
          </div>
        }
        @if (!locked(field.key)) {
          <button hlmBtn variant="ghost" type="button" (click)="remove(i)">
            {{ 'cmsRemoveField' | t }}
          </button>
        }
      </fieldset>
    }
    <button hlmBtn variant="outline" type="button" (click)="add()" [disabled]="disabled()">
      {{ 'cmsAddField' | t }}
    </button>
  </div>`,
})
export class ContentSchemaFields {
  readonly fields = model<ContentField[]>([]);
  readonly original = input<ContentField[]>([]);
  readonly collections = input<ContentCollection[]>([]);
  readonly prefix = input('schema-');
  readonly disabled = input(false);
  readonly types = [
    'text',
    'richText',
    'number',
    'boolean',
    'date',
    'file',
    'image',
    'select',
    'group',
    'reference',
  ];
  originalField(key: string) {
    return this.original().find((f) => f.key === key);
  }
  locked(key: string) {
    return !!this.originalField(key);
  }
  set(index: number, key: string, value: unknown) {
    this.fields.update((fields) =>
      fields.map((f, i) =>
        i === index
          ? {
              ...f,
              ...(key === 'type' ? { fields: [], options: [], collection: null } : {}),
              [key]: value,
            }
          : f,
      ),
    );
  }
  options(index: number, value: string) {
    this.set(
      index,
      'options',
      value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    );
  }
  add() {
    this.fields.update((fields) => [...fields, { key: '', label: '', type: 'text' }]);
  }
  remove(index: number) {
    this.fields.update((fields) => fields.filter((_, i) => i !== index));
  }
}
