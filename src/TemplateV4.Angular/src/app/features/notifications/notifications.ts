import { Injectable, inject } from '@angular/core';
import { toast } from '@spartan-ng/brain/sonner';
import { I18n } from '../../core/i18n';
import { UiSounds } from '../../core/ui-sounds';

export interface ProblemNotification {
  title?: string;
}

@Injectable({ providedIn: 'root' })
export class Notifications {
  private readonly i18n = inject(I18n);
  private readonly sounds = inject(UiSounds);

  success(key: string) {
    toast.success(this.i18n.text(key));
    this.sounds.play('success');
  }

  error(problem: ProblemNotification) {
    toast.error(problem.title?.trim() || this.i18n.text('error'), { important: true });
    this.sounds.play('error');
  }
}
