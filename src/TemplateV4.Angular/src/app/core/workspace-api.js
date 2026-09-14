import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { firstValueFrom, filter, tap, fromEvent, takeUntil, NEVER } from 'rxjs';
import { Runtime } from './runtime';
import { Auth } from './auth';
import * as i0 from "@angular/core";
export class WorkspaceApi {
    http = inject(HttpClient);
    runtime = inject(Runtime);
    auth = inject(Auth);
    get(path, params = {}, signal) {
        const url = path.startsWith('/') ? `/api/v1${path}` : `/api/v1/auth/${path}`;
        if (signal?.aborted)
            return Promise.reject(new DOMException('Aborted', 'AbortError'));
        return firstValueFrom(this.http
            .get(`${this.runtime.apiUrl}${url}`, { params })
            .pipe(takeUntil(signal ? fromEvent(signal, 'abort') : NEVER)));
    }
    post(path, body = {}) {
        return this.auth.action(path, body);
    }
    async upload(file, progress, parentId = '', signal) {
        signal?.throwIfAborted();
        const headers = await this.auth.browserHeaders();
        signal?.throwIfAborted();
        await firstValueFrom(this.http
            .post(`${this.runtime.apiUrl}/api/v1/auth/my-files/upload`, file, {
            params: { name: file.name, ...(parentId ? { parentId } : {}) },
            headers: { ...headers, 'Content-Type': 'application/octet-stream' },
            withCredentials: true,
            observe: 'events',
            reportProgress: true,
        })
            .pipe(tap((event) => {
            if (event.type === HttpEventType.UploadProgress)
                progress(Math.round((100 * event.loaded) / (event.total || file.size)));
        }), filter((event) => event.type === HttpEventType.Response), takeUntil(signal ? fromEvent(signal, 'abort') : NEVER)));
    }
    async download(path, name) {
        const blob = await firstValueFrom(this.http.get(`${this.runtime.apiUrl}/api/v1/auth/${path}`, { responseType: 'blob' }));
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    static ɵfac = function WorkspaceApi_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || WorkspaceApi)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: WorkspaceApi, factory: WorkspaceApi.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(WorkspaceApi, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
