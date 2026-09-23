import { Component, inject } from '@angular/core';
import { WorkspaceUi, Resource } from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import { WorkspaceApi } from '../../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import { Auth } from '../../../../../src/TemplateV4.Angular/src/app/core/auth';
import { ContentCollection } from '../../../../../src/TemplateV4.Angular/src/app/api/models';

@Component({
  selector: 'app-content-collections',
  imports: [WorkspaceUi],
  template: `<app-page-header title="cms" description="cmsCollectionsHelp">
      @if (auth.has('cms.schema.manage')) {
        <a hlmBtn routerLink="/cms/collections/new">{{ 'cmsNewCollection' | t }}</a>
      }
      @if (auth.has('cms.edit')) {
        <a hlmBtn variant="outline" routerLink="/cms/sections">{{ 'cmsSections' | t }}</a>
      }
    </app-page-header>
    <app-page-state [state]="data.state()" (retry)="load()" skeleton="empty">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        @for (collection of data.value(); track collection.key) {
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ collection.label }}</h2>
              <p hlmCardDescription>{{ collection.key }}</p>
            </div>
            <div hlmCardContent class="flex flex-wrap gap-3">
              @if (canRead(collection)) {
                <a hlmBtn variant="outline" [routerLink]="['/cms/collections', collection.key]">{{
                  'cmsItems' | t
                }}</a>
              }
              @if (collection.actions.includes('cms.schema.manage') || auth.has('roles.manage')) {
                <a
                  hlmBtn
                  variant="ghost"
                  [routerLink]="['/cms/collections', collection.key, 'settings']"
                  >{{ 'cmsSchema' | t }}</a
                >
              }
            </div>
          </section>
        } @empty {
          <p>{{ 'cmsNoCollections' | t }}</p>
        }
      </div>
    </app-page-state>`,
})
export class ContentCollectionsPage {
  readonly auth = inject(Auth);
  private readonly api = inject(WorkspaceApi);
  readonly data = new Resource<ContentCollection[]>();
  constructor() {
    void this.load();
  }
  canRead(collection: ContentCollection) {
    return collection.actions.some((x) => x !== 'cms.schema.manage');
  }
  load() {
    return this.data.load((signal) => this.api.get('cms/collections', {}, signal));
  }
}
