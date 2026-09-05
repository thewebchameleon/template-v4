import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Auth } from './auth';
import { Runtime } from './runtime';

@Injectable({ providedIn: 'root' })
export class Registration {
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(Runtime);
  private readonly auth = inject(Auth);

  status(): Promise<{ enabled: boolean }> {
    return firstValueFrom(
      this.http.get<{ enabled: boolean }>(`${this.runtime.apiUrl}/api/v1/auth/registration`),
    );
  }

  register(request: {
    email: string;
    displayName: string;
    password: string;
    culture: string;
  }): Promise<void> {
    return this.auth.action('register', request);
  }
}
