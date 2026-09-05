import { Injectable, inject } from '@angular/core';
import { toast } from '@spartan-ng/brain/sonner';
import { I18n } from './i18n';

export interface ProblemNotification {
  code: string;
  traceId?: string;
  title?: string;
}

@Injectable({ providedIn: 'root' })
export class Notifications {
  private readonly i18n = inject(I18n);

  success(key: string) {
    toast.success(this.i18n.text(key));
  }

  error(problem: ProblemNotification) {
    const details = [problem.title, problem.code, problem.traceId].filter(Boolean).join(' · ');
    toast.error(this.i18n.text('error'), {
      description: details || undefined,
      important: true,
    });
  }
}
