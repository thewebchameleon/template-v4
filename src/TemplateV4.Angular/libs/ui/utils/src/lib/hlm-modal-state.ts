import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HlmModalState {
  private readonly _openModals = new Set<object>();

  public readonly hasOpenModal = signal(false);

  public register(modal: object): () => void {
    this._openModals.add(modal);
    this.hasOpenModal.set(true);

    return () => {
      this._openModals.delete(modal);
      this.hasOpenModal.set(this._openModals.size > 0);
    };
  }
}
