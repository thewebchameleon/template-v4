import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { firstValueFrom, filter, tap, fromEvent, takeUntil, NEVER } from 'rxjs';
import { Runtime } from './runtime';
import { Auth } from './auth';

@Injectable({ providedIn: 'root' })
export class WorkspaceApi {
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(Runtime);
  private readonly auth = inject(Auth);
  get<T>(
    path: string,
    params: Record<string, string | number | boolean> = {},
    signal?: AbortSignal,
  ) {
    const url = path.startsWith('/') ? `/api/v1${path}` : `/api/v1/auth/${path}`;
    if (signal?.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'));
    return firstValueFrom(
      this.http
        .get<T>(`${this.runtime.apiUrl}${url}`, { params })
        .pipe(takeUntil(signal ? fromEvent(signal, 'abort') : NEVER)),
    );
  }
  post<T = unknown>(path: string, body: unknown = {}) {
    return this.auth.action<T>(path, body);
  }
  async upload(file: File, progress: (value: number) => void, parentId = '') {
    const headers = await this.auth.browserHeaders();
    await firstValueFrom(
      this.http
        .post(`${this.runtime.apiUrl}/api/v1/auth/files/upload`, file, {
          params: { name: file.name, ...(parentId ? { parentId } : {}) },
          headers: { ...headers, 'Content-Type': 'application/octet-stream' },
          withCredentials: true,
          observe: 'events',
          reportProgress: true,
        })
        .pipe(
          tap((event) => {
            if (event.type === HttpEventType.UploadProgress)
              progress(Math.round((100 * event.loaded) / (event.total || file.size)));
          }),
          filter((event) => event.type === HttpEventType.Response),
        ),
    );
  }
  async download(path: string, name: string) {
    const blob = await firstValueFrom(
      this.http.get(`${this.runtime.apiUrl}/api/v1/auth/${path}`, { responseType: 'blob' }),
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
