import { Injectable, computed, effect, inject, signal, DestroyRef, untracked } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { firstValueFrom, Subject } from 'rxjs';
import { Auth } from './auth';
import { Runtime } from './runtime';
import { QUIET_REQUEST } from './interceptors';
import { UiSounds } from './ui-sounds';
import * as i0 from "@angular/core";
export class UnreadNotifications {
    auth = inject(Auth);
    http = inject(HttpClient);
    runtime = inject(Runtime);
    sounds = inject(UiSounds);
    hasSummary = false;
    count = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "count" }] : /* istanbul ignore next */ []));
    changes = new Subject();
    revision = 0;
    pending = false;
    failures = 0;
    nextAt = 0;
    refreshRequested = false;
    connection = null;
    connectionGeneration = 0;
    actor = computed(() => this.auth.access()?.setupRequired ? null : this.auth.access()?.userId, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "actor" }] : /* istanbul ignore next */ []));
    constructor() {
        effect(() => {
            const actor = this.actor();
            this.set(0);
            this.hasSummary = false;
            this.nextAt = 0;
            untracked(() => {
                void this.refresh();
                void this.connect(actor);
            });
        });
        const timer = setInterval(() => void this.refresh(), 60000);
        inject(DestroyRef).onDestroy(() => {
            clearInterval(timer);
            this.connectionGeneration++;
            void this.connection?.stop();
        });
    }
    set(count) {
        this.revision++;
        this.count.set(Math.max(0, count));
    }
    invalidate() {
        this.revision++;
        if (this.pending)
            this.refreshRequested = true;
        else
            void this.refresh(true);
    }
    async connect(actor) {
        const generation = ++this.connectionGeneration;
        const previous = this.connection;
        this.connection = null;
        if (previous)
            await previous.stop();
        if (!actor || generation !== this.connectionGeneration)
            return;
        const { connectNotifications } = await import('./notification-connection');
        if (generation !== this.connectionGeneration || actor !== this.actor())
            return;
        const active = () => generation === this.connectionGeneration && actor === this.actor();
        const connection = await connectNotifications({
            actor,
            url: `${this.runtime.apiUrl}/api/v1/auth/notifications/stream`,
            access: () => this.auth.access(),
            refresh: () => this.auth.refresh(),
            active,
            changed: () => {
                this.invalidate();
                this.changes.next();
            },
        });
        if (active())
            this.connection = connection;
        else
            await connection.stop();
    }
    async refresh(force = false) {
        const actor = this.actor();
        if (!actor ||
            this.pending ||
            document.visibilityState !== 'visible' ||
            (!force && Date.now() < this.nextAt))
            return;
        this.pending = true;
        const revision = this.revision;
        try {
            const value = await firstValueFrom(this.http.get(this.runtime.apiUrl + '/api/v1/auth/notifications/summary', { context: new HttpContext().set(QUIET_REQUEST, true) }));
            if (actor === this.actor() && revision === this.revision) {
                if (this.hasSummary && value.unread > this.count())
                    this.sounds.play('ping');
                this.count.set(value.unread);
                this.hasSummary = true;
            }
            this.failures = 0;
        }
        catch {
            this.failures = Math.min(this.failures + 1, 4);
        }
        finally {
            this.pending = false;
            this.nextAt = Date.now() + 60000 * 2 ** this.failures;
            if (this.refreshRequested) {
                this.refreshRequested = false;
                queueMicrotask(() => void this.refresh(true));
            }
        }
    }
    static ɵfac = function UnreadNotifications_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || UnreadNotifications)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: UnreadNotifications, factory: UnreadNotifications.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(UnreadNotifications, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [], null); })();
