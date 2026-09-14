import { Directive, HostListener } from '@angular/core';
import { protectUnload } from './confirmation';

@Directive()
export abstract class BusinessDraft {
  private savedDraft = '';
  protected abstract draftValue(): unknown;
  protected markSaved() {
    this.savedDraft = JSON.stringify(this.draftValue());
  }
  hasUnsavedChanges() {
    return this.savedDraft !== '' && this.savedDraft !== JSON.stringify(this.draftValue());
  }
  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
}
