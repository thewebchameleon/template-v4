import { Injectable, inject } from '@angular/core';
import { toast } from '@spartan-ng/brain/sonner';
import { I18n } from './i18n';

export interface ProblemNotification {
  title?: string;
}

@Injectable({ providedIn: 'root' })
export class Notifications {
  private readonly i18n = inject(I18n);

  success(key: string) {
    toast.success(this.i18n.text(key));
  }

  error(problem: ProblemNotification) {
    toast.error(problem.title?.trim() || this.i18n.text('error'), { important: true });
  }
}
