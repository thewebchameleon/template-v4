import { Injectable } from '@angular/core';
import { BaseRouteReuseStrategy } from '@angular/router';
import * as i0 from "@angular/core";
export class EntityRouteReuseStrategy extends BaseRouteReuseStrategy {
    shouldReuseRoute(future, current) {
        // Query changes retain list state. Entity changes destroy drafts and cancel Resource loads.
        return (super.shouldReuseRoute(future, current) &&
            future.paramMap.keys.length === current.paramMap.keys.length &&
            future.paramMap.keys.every((key) => future.paramMap.get(key) === current.paramMap.get(key)));
    }
    static ɵfac = /*@__PURE__*/ (() => { let ɵEntityRouteReuseStrategy_BaseFactory; return function EntityRouteReuseStrategy_Factory(__ngFactoryType__) { return (ɵEntityRouteReuseStrategy_BaseFactory || (ɵEntityRouteReuseStrategy_BaseFactory = i0.ɵɵgetInheritedFactory(EntityRouteReuseStrategy)))(__ngFactoryType__ || EntityRouteReuseStrategy); }; })();
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: EntityRouteReuseStrategy, factory: EntityRouteReuseStrategy.ɵfac });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(EntityRouteReuseStrategy, [{
        type: Injectable
    }], null, null); })();
