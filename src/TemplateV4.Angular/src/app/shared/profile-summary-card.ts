import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { CustomerInfo, ProfileResponse } from '../api/models';
import { I18n, Translate } from '../core/i18n';

@Component({
  selector: 'app-profile-summary-card',
  imports: [
    RouterLink,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmSkeletonImports,
    Translate,
  ],
  template: `
    <section hlmCard aria-labelledby="profile-summary-title">
      <div hlmCardHeader>
        <p hlmCardTitle id="profile-summary-title">{{ 'profileSummary' | t }}</p>
      </div>
      <div hlmCardContent>
        <div class="grid gap-8 lg:grid-cols-2">
          <section class="grid gap-5" [attr.aria-label]="'personalDetails' | t">
            @if (profile(); as person) {
              <div class="flex min-w-0 items-center gap-4">
                @if (person.avatarDataUrl; as avatar) {
                  <img
                    class="size-16 shrink-0 rounded-full border object-cover"
                    [src]="avatar"
                    [alt]="person.displayName"
                  />
                } @else {
                  <span
                    class="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold"
                    aria-hidden="true"
                    >{{ initials(person.displayName) }}</span
                  >
                }
                <div class="min-w-0 flex-1">
                  <p class="truncate text-lg font-semibold">{{ person.displayName }}</p>
                  <p class="break-words text-sm text-muted-foreground">{{ person.email }}</p>
                </div>
                <a hlmBtn variant="outline" size="sm" class="shrink-0" routerLink="/me">
                  {{ 'edit' | t }}
                </a>
              </div>
              <dl class="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt class="text-sm text-muted-foreground">{{ 'emailVerification' | t }}</dt>
                  <dd class="mt-1">
                    <span hlmBadge [variant]="person.emailConfirmed ? 'secondary' : 'outline'">
                      {{
                        (person.emailConfirmed ? 'emailVerifiedStatus' : 'emailUnverifiedStatus')
                          | t
                      }}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt class="text-sm text-muted-foreground">{{ 'culture' | t }}</dt>
                  <dd class="mt-1 break-words font-medium">{{ languageLabel() }}</dd>
                </div>
                <div>
                  <dt class="text-sm text-muted-foreground">{{ 'timeZone' | t }}</dt>
                  <dd class="mt-1 break-words font-medium">{{ timeZoneLabel() }}</dd>
                </div>
              </dl>
            } @else {
              <div class="grid gap-4" role="status">
                <span class="sr-only">{{ 'loading' | t }}</span>
                <div hlmSkeleton class="h-16 w-full"></div>
                <div hlmSkeleton class="h-16 w-full"></div>
              </div>
            }
          </section>

          <section
            class="grid gap-5 lg:border-s lg:ps-8"
            [attr.aria-label]="'organisationDetails' | t"
          >
            @if (organisation(); as company) {
              <div class="flex min-w-0 items-center gap-4">
                @if (company.logoUrl; as logo) {
                  <img
                    class="size-16 shrink-0 rounded-lg border object-contain p-1"
                    [src]="logo"
                    [alt]="company.name"
                  />
                } @else {
                  <span
                    class="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted text-lg font-semibold"
                    aria-hidden="true"
                    >{{ initials(company.name) }}</span
                  >
                }
                <p class="min-w-0 flex-1 break-words text-lg font-semibold">{{ company.name }}</p>
                <a
                  hlmBtn
                  variant="outline"
                  size="sm"
                  class="shrink-0"
                  routerLink="/administration/branding"
                >
                  {{ 'edit' | t }}
                </a>
              </div>
              <dl class="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt class="text-sm text-muted-foreground">{{ 'website' | t }}</dt>
                  <dd class="mt-1 break-words font-medium">{{ value(company.websiteUrl) }}</dd>
                </div>
                <div>
                  <dt class="text-sm text-muted-foreground">{{ 'primaryContactEmail' | t }}</dt>
                  <dd class="mt-1 break-words font-medium">{{ value(company.contactEmail) }}</dd>
                </div>
                <div>
                  <dt class="text-sm text-muted-foreground">{{ 'country' | t }}</dt>
                  <dd class="mt-1 flex items-center gap-2 break-words font-medium">
                    @if (country(); as country) {
                      <img
                        [src]="country.flagUrl"
                        alt=""
                        aria-hidden="true"
                        class="h-4 w-6 shrink-0 rounded-xs object-cover"
                      />
                      <span>{{ country.name }}</span>
                    } @else {
                      —
                    }
                  </dd>
                </div>
                <div>
                  <dt class="text-sm text-muted-foreground">{{ 'primaryContactNumber' | t }}</dt>
                  <dd class="mt-1 break-words font-medium">
                    {{ value(company.primaryContactNumber) }}
                  </dd>
                </div>
              </dl>
            } @else {
              <div class="grid gap-4" role="status">
                <span class="sr-only">{{ 'loading' | t }}</span>
                <div hlmSkeleton class="h-16 w-full"></div>
                <div hlmSkeleton class="h-16 w-full"></div>
              </div>
            }
          </section>
        </div>
      </div>
    </section>
  `,
})
export class ProfileSummaryCard {
  private readonly i18n = inject(I18n);
  readonly profile = input<ProfileResponse | null>(null);
  readonly organisation = input<CustomerInfo | null>(null);
  readonly country = computed(() => {
    const code = this.organisation()?.country?.trim().toUpperCase();
    if (!code) return null;
    return {
      name: new Intl.DisplayNames([this.i18n.culture()], { type: 'region' }).of(code),
      flagUrl: `/assets/flags/4x3/${code.toLowerCase()}.svg`,
    };
  });
  readonly languageLabel = computed(() => {
    const culture = this.profile()?.culture;
    if (!culture) return '';
    const language = new Intl.Locale(culture).language;
    const name = new Intl.DisplayNames([this.i18n.culture()], { type: 'language' }).of(language);
    return `${name} (${culture})`;
  });
  readonly timeZoneLabel = computed(() => {
    const timeZone = this.profile()?.timeZone;
    if (!timeZone) return '';
    const offset = new Intl.DateTimeFormat('en', {
      timeZone,
      timeZoneName: 'longOffset',
    })
      .formatToParts(new Date())
      .find((part) => part.type === 'timeZoneName')!.value;
    return `(${offset === 'GMT' ? 'GMT+00:00' : offset}) ${timeZone}`;
  });

  initials(value: string) {
    return value
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  value(value: string | null) {
    return value?.trim() || '—';
  }
}
