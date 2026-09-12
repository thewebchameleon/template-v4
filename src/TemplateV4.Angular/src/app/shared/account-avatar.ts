import { Component, inject } from '@angular/core';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUserRound } from '@ng-icons/lucide';
import { CurrentProfile } from '../core/current-profile';

@Component({
  selector: 'app-account-avatar',
  imports: [HlmAvatarImports, NgIcon],
  providers: [provideIcons({ lucideUserRound })],
  template: `<hlm-avatar
    class="size-(--app-sidebar-rail-target-size) rounded-(--radius) after:rounded-(--radius)"
  >
    @if (profile.value()?.avatarDataUrl; as photo) {
      <img hlmAvatarImage [src]="photo" alt="" />
    }
    <span hlmAvatarFallback class="rounded-(--radius) bg-primary text-primary-foreground"
      ><ng-icon name="lucideUserRound" size="1.5rem"
    /></span>
  </hlm-avatar>`,
})
export class AccountAvatar {
  readonly profile = inject(CurrentProfile);
}
