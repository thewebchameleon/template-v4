import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheckCircleFill, phosphorXCircleFill } from '@ng-icons/phosphor-icons/fill';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { CustomerInfo, ProfileResponse } from '../api/models';
import { I18n, Translate, browserTimeZone } from '../core/i18n';

@Component({
  selector: 'app-profile-summary-card',
  imports: [
    RouterLink,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmSkeletonImports,
    Translate,
  ],
  providers: [provideIcons({ phosphorCheckCircleFill, phosphorXCircleFill })],
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
                  <p class="flex items-center gap-1.5 break-words text-sm text-muted-foreground">
                    <span
                      role="img"
                      class="inline-flex size-5 shrink-0 items-center justify-center"
                      [class]="
                        person.emailConfirmed
                          ? 'text-green-600 dark:text-green-500'
                          : 'text-orange-600 dark:text-orange-500'
                      "
                      [attr.aria-label]="
                        (person.emailConfirmed ? 'emailVerifiedStatus' : 'emailUnverifiedStatus')
                          | t
                      "
                    >
                      <ng-icon
                        [name]="person.emailConfirmed ? 'phosphorCheckCircleFill' : 'phosphorXCircleFill'"
                        size="1.25rem"
                        aria-hidden="true"
                      />
                    </span>
                    <span class="min-w-0 break-words">{{ person.email }}</span>
                  </p>
                </div>
                <a hlmBtn variant="outline" size="sm" class="shrink-0" routerLink="/me">
                  {{ 'edit' | t }}
                </a>
              </div>
              <dl class="grid gap-x-6 gap-y-4 sm:grid-cols-2">
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
              <div class="grid gap-5" role="status">
                <span class="sr-only">{{ 'loading' | t }}</span>
                <div class="flex items-center gap-4">
                  <div hlmSkeleton class="size-16 shrink-0 rounded-full motion-reduce:animate-none"></div>
                  <div class="grid min-w-0 flex-1 gap-2">
                    <div hlmSkeleton class="h-5 w-40 max-w-full motion-reduce:animate-none"></div>
                    <div hlmSkeleton class="h-4 w-56 max-w-full motion-reduce:animate-none"></div>
                  </div>
                </div>
                <div class="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                  @for (field of [1, 2]; track field) {
                    <div class="grid gap-2">
                      <div hlmSkeleton class="h-4 w-24 motion-reduce:animate-none"></div>
                      <div hlmSkeleton class="h-5 w-32 motion-reduce:animate-none"></div>
                    </div>
                  }
                </div>
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
                <div class="min-w-0 flex-1">
                  <p class="break-words text-lg font-semibold">{{ company.name }}</p>
                  <div class="flex min-w-0 flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    @if (country(); as country) {
                      <span class="inline-flex items-center gap-2">
                        <img
                          [src]="country.flagUrl"
                          alt=""
                          aria-hidden="true"
                          class="h-4 w-6 shrink-0 rounded-xs object-cover"
                        />
                        <span>
                          <span class="sr-only">{{ 'country' | t }}: </span>{{ country.name }}
                        </span>
                      </span>
                    }
                    @if (company.websiteUrl?.trim(); as website) {
                      <span class="min-w-0 break-words">{{ website }}</span>
                    }
                  </div>
                </div>
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
                  <dt class="text-sm text-muted-foreground">{{ 'primaryContactEmail' | t }}</dt>
                  <dd class="mt-1 break-words font-medium">{{ value(company.contactEmail) }}</dd>
                </div>
                <div>
                  <dt class="text-sm text-muted-foreground">{{ 'primaryContactNumber' | t }}</dt>
                  <dd class="mt-1 break-words font-medium">
                    {{ value(company.primaryContactNumber) }}
                  </dd>
                </div>
              </dl>
            } @else {
              <div class="grid gap-5" role="status">
                <span class="sr-only">{{ 'loading' | t }}</span>
                <div class="flex items-center gap-4">
                  <div hlmSkeleton class="size-16 shrink-0 rounded-lg motion-reduce:animate-none"></div>
                  <div class="grid min-w-0 flex-1 gap-2">
                    <div hlmSkeleton class="h-5 w-40 max-w-full motion-reduce:animate-none"></div>
                    <div hlmSkeleton class="h-4 w-56 max-w-full motion-reduce:animate-none"></div>
                  </div>
                </div>
                <div class="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                  @for (field of [1, 2]; track field) {
                    <div class="grid gap-2">
                      <div hlmSkeleton class="h-4 w-24 motion-reduce:animate-none"></div>
                      <div hlmSkeleton class="h-5 w-32 motion-reduce:animate-none"></div>
                    </div>
                  }
                </div>
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
    const timeZone = this.profile()?.timeZone?.trim() || browserTimeZone();
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
