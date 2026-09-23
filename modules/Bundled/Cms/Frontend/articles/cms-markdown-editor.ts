import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewEncapsulation,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBold,
  lucideCode,
  lucideHeading1,
  lucideHeading2,
  lucideHeading3,
  lucideHeading4,
  lucideItalic,
  lucideList,
  lucideListOrdered,
  lucideQuote,
  lucideRedo2,
  lucideSquareCode,
  lucideUndo2,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { Editor } from '@tiptap/core';
import { Markdown } from '@tiptap/markdown';
import StarterKit from '@tiptap/starter-kit';
import { I18n } from '../../../../../src/TemplateV4.Angular/src/app/core/i18n';

const editorLabels = {
  toolbar: ['Text formatting', 'Teksformatering'],
  bold: ['Bold', 'Vetdruk'],
  italic: ['Italic', 'Skuinsdruk'],
  inlineCode: ['Inline code', 'Inlynkode'],
  heading1: ['Heading 1', 'Opskrif 1'],
  heading2: ['Heading 2', 'Opskrif 2'],
  heading3: ['Heading 3', 'Opskrif 3'],
  heading4: ['Heading 4', 'Opskrif 4'],
  bulletList: ['Bulleted list', 'Kolpuntlys'],
  orderedList: ['Numbered list', 'Genommerde lys'],
  quote: ['Quote', 'Aanhaling'],
  codeBlock: ['Code block', 'Kodeblok'],
  undo: ['Undo', 'Ontdoen'],
  redo: ['Redo', 'Herdoen'],
} as const;

@Component({
  selector: 'app-cms-markdown-editor',
  imports: [NgIcon, HlmButtonImports, HlmSeparator],
  providers: [
    provideIcons({
      lucideBold,
      lucideCode,
      lucideHeading1,
      lucideHeading2,
      lucideHeading3,
      lucideHeading4,
      lucideItalic,
      lucideList,
      lucideListOrdered,
      lucideQuote,
      lucideRedo2,
      lucideSquareCode,
      lucideUndo2,
    }),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CmsMarkdownEditor),
      multi: true,
    },
  ],
  encapsulation: ViewEncapsulation.None,
  host: {
    '[attr.aria-disabled]': 'isDisabled() || null',
  },
  styles: `
    app-cms-markdown-editor {
      display: block;
    }
    app-cms-markdown-editor .cms-markdown-shell {
      overflow: hidden;
      border: 1px solid var(--input);
      border-radius: var(--radius);
      background: var(--background);
    }
    app-cms-markdown-editor .cms-markdown-shell:focus-within {
      border-color: var(--ring);
      box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent);
    }
    app-cms-markdown-editor .cms-markdown-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.25rem;
      border-bottom: 1px solid var(--border);
      background: color-mix(in oklch, var(--muted) 40%, transparent);
      padding: 0.25rem;
    }
    app-cms-markdown-editor .ProseMirror {
      min-height: 18rem;
      padding: 0.75rem;
      outline: none;
    }
    app-cms-markdown-editor .ProseMirror > :first-child {
      margin-block-start: 0;
    }
    app-cms-markdown-editor .ProseMirror > :last-child {
      margin-block-end: 0;
    }
    app-cms-markdown-editor[aria-disabled='true'] .cms-markdown-shell {
      opacity: 0.5;
    }
  `,
  template: `
    <div class="cms-markdown-shell">
      <div class="cms-markdown-toolbar" role="toolbar" [attr.aria-label]="label('toolbar')">
        <button
          hlmBtn
          type="button"
          size="icon-sm"
          [variant]="active('bold') ? 'secondary' : 'ghost'"
          [disabled]="isDisabled()"
          [attr.aria-label]="label('bold')"
          [attr.aria-pressed]="active('bold')"
          [title]="label('bold')"
          (click)="toggleBold()"
        >
          <ng-icon name="lucideBold" />
        </button>
        <button
          hlmBtn
          type="button"
          size="icon-sm"
          [variant]="active('italic') ? 'secondary' : 'ghost'"
          [disabled]="isDisabled()"
          [attr.aria-label]="label('italic')"
          [attr.aria-pressed]="active('italic')"
          [title]="label('italic')"
          (click)="toggleItalic()"
        >
          <ng-icon name="lucideItalic" />
        </button>
        <button
          hlmBtn
          type="button"
          size="icon-sm"
          [variant]="active('code') ? 'secondary' : 'ghost'"
          [disabled]="isDisabled()"
          [attr.aria-label]="label('inlineCode')"
          [attr.aria-pressed]="active('code')"
          [title]="label('inlineCode')"
          (click)="toggleCode()"
        >
          <ng-icon name="lucideCode" />
        </button>
        <hlm-separator orientation="vertical" decorative class="mx-1 min-h-6" />
        @for (heading of headings; track heading.level) {
          <button
            hlmBtn
            type="button"
            size="icon-sm"
            [variant]="active('heading', { level: heading.level }) ? 'secondary' : 'ghost'"
            [disabled]="isDisabled()"
            [attr.aria-label]="label(heading.label)"
            [attr.aria-pressed]="active('heading', { level: heading.level })"
            [title]="label(heading.label)"
            (click)="toggleHeading(heading.level)"
          >
            <ng-icon [name]="heading.icon" />
          </button>
        }
        <button
          hlmBtn
          type="button"
          size="icon-sm"
          [variant]="active('bulletList') ? 'secondary' : 'ghost'"
          [disabled]="isDisabled()"
          [attr.aria-label]="label('bulletList')"
          [attr.aria-pressed]="active('bulletList')"
          [title]="label('bulletList')"
          (click)="toggleBulletList()"
        >
          <ng-icon name="lucideList" />
        </button>
        <button
          hlmBtn
          type="button"
          size="icon-sm"
          [variant]="active('orderedList') ? 'secondary' : 'ghost'"
          [disabled]="isDisabled()"
          [attr.aria-label]="label('orderedList')"
          [attr.aria-pressed]="active('orderedList')"
          [title]="label('orderedList')"
          (click)="toggleOrderedList()"
        >
          <ng-icon name="lucideListOrdered" />
        </button>
        <button
          hlmBtn
          type="button"
          size="icon-sm"
          [variant]="active('blockquote') ? 'secondary' : 'ghost'"
          [disabled]="isDisabled()"
          [attr.aria-label]="label('quote')"
          [attr.aria-pressed]="active('blockquote')"
          [title]="label('quote')"
          (click)="toggleBlockquote()"
        >
          <ng-icon name="lucideQuote" />
        </button>
        <button
          hlmBtn
          type="button"
          size="icon-sm"
          [variant]="active('codeBlock') ? 'secondary' : 'ghost'"
          [disabled]="isDisabled()"
          [attr.aria-label]="label('codeBlock')"
          [attr.aria-pressed]="active('codeBlock')"
          [title]="label('codeBlock')"
          (click)="toggleCodeBlock()"
        >
          <ng-icon name="lucideSquareCode" />
        </button>
        <hlm-separator orientation="vertical" decorative class="mx-1 min-h-6" />
        <button
          hlmBtn
          type="button"
          size="icon-sm"
          variant="ghost"
          [disabled]="isDisabled() || !canUndo()"
          [attr.aria-label]="label('undo')"
          [title]="label('undo')"
          (click)="undo()"
        >
          <ng-icon name="lucideUndo2" />
        </button>
        <button
          hlmBtn
          type="button"
          size="icon-sm"
          variant="ghost"
          [disabled]="isDisabled() || !canRedo()"
          [attr.aria-label]="label('redo')"
          [title]="label('redo')"
          (click)="redo()"
        >
          <ng-icon name="lucideRedo2" />
        </button>
      </div>
      <div #editorHost class="cms-prose"></div>
    </div>
  `,
})
export class CmsMarkdownEditor implements AfterViewInit, OnDestroy, ControlValueAccessor {
  readonly headings = [
    { level: 1, icon: 'lucideHeading1', label: 'heading1' },
    { level: 2, icon: 'lucideHeading2', label: 'heading2' },
    { level: 3, icon: 'lucideHeading3', label: 'heading3' },
    { level: 4, icon: 'lucideHeading4', label: 'heading4' },
  ] as const;
  readonly inputId = input.required<string>();
  readonly describedBy = input<string>();
  readonly disabled = input(false);
  private readonly editorHost = viewChild.required<ElementRef<HTMLDivElement>>('editorHost');
  private readonly i18n = inject(I18n);
  private readonly formDisabled = signal(false);
  private readonly revision = signal(0);
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  private editor?: Editor;
  private value = '';
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    effect(() => {
      this.i18n.culture();
      const disabled = this.isDisabled();
      this.editor?.setEditable(!disabled);
      if (this.editor) this.editor.setOptions({ editorProps: { attributes: this.attributes() } });
    });
  }

  ngAfterViewInit() {
    this.editor = new Editor({
      element: this.editorHost().nativeElement,
      extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }), Markdown],
      content: this.value,
      contentType: 'markdown',
      editable: !this.isDisabled(),
      editorProps: { attributes: this.attributes() },
      onUpdate: ({ editor }) => {
        this.value = editor.getMarkdown();
        this.onChange(this.value);
        this.bump();
      },
      onSelectionUpdate: () => this.bump(),
      onBlur: () => this.onTouched(),
    });
    this.bump();
  }

  ngOnDestroy() {
    this.editor?.destroy();
  }

  writeValue(value: string | null | undefined) {
    this.value = value ?? '';
    this.editor?.commands.setContent(this.value, {
      contentType: 'markdown',
      emitUpdate: false,
    });
    this.bump();
  }

  registerOnChange(fn: (value: string) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean) {
    this.formDisabled.set(disabled);
  }

  label(key: keyof typeof editorLabels) {
    return editorLabels[key][this.i18n.culture() === 'af-ZA' ? 1 : 0];
  }

  active(name: string, attributes?: Record<string, unknown>) {
    this.revision();
    return this.editor?.isActive(name, attributes) ?? false;
  }

  canUndo() {
    this.revision();
    return this.editor?.can().chain().undo().run() ?? false;
  }

  canRedo() {
    this.revision();
    return this.editor?.can().chain().redo().run() ?? false;
  }

  toggleBold() {
    this.editor?.chain().focus().toggleBold().run();
  }

  toggleItalic() {
    this.editor?.chain().focus().toggleItalic().run();
  }

  toggleCode() {
    this.editor?.chain().focus().toggleCode().run();
  }

  toggleHeading(level: 1 | 2 | 3 | 4) {
    this.editor?.chain().focus().toggleHeading({ level }).run();
  }

  toggleBulletList() {
    this.editor?.chain().focus().toggleBulletList().run();
  }

  toggleOrderedList() {
    this.editor?.chain().focus().toggleOrderedList().run();
  }

  toggleBlockquote() {
    this.editor?.chain().focus().toggleBlockquote().run();
  }

  toggleCodeBlock() {
    this.editor?.chain().focus().toggleCodeBlock().run();
  }

  undo() {
    this.editor?.chain().focus().undo().run();
  }

  redo() {
    this.editor?.chain().focus().redo().run();
  }

  private attributes() {
    return {
      id: this.inputId(),
      role: 'textbox',
      'aria-label': this.i18n.text('cmsMarkdown'),
      'aria-multiline': 'true',
      'aria-describedby': this.describedBy() ?? '',
    };
  }

  private bump() {
    this.revision.update((value) => value + 1);
  }
}
