import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, BaseRouteReuseStrategy } from '@angular/router';

@Injectable()
export class EntityRouteReuseStrategy extends BaseRouteReuseStrategy {
  override shouldReuseRoute(future: ActivatedRouteSnapshot, current: ActivatedRouteSnapshot) {
    // Query changes retain list state. Entity changes destroy drafts and cancel Resource loads.
    return (
      super.shouldReuseRoute(future, current) &&
      future.paramMap.keys.length === current.paramMap.keys.length &&
      future.paramMap.keys.every((key) => future.paramMap.get(key) === current.paramMap.get(key))
    );
  }
}
