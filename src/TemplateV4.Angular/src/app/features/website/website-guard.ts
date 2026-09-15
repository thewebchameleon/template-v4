import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
export async function websiteSetupRedirect(http: HttpClient, router: Router, apiUrl: string) {
  try {
    const site = await firstValueFrom(
      http.get<{ configured: boolean }>(apiUrl + '/api/v1/auth/website'),
    );
    return site.configured ? true : router.createUrlTree(['/administration/website']);
  } catch {
    return router.createUrlTree(['/administration/website']);
  }
}
