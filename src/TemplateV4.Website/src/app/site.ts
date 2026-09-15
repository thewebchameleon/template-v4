import { HttpClient } from "@angular/common/http";
import {
  inject,
  makeStateKey,
  REQUEST_CONTEXT,
  RESPONSE_INIT,
  TransferState,
} from "@angular/core";
import { ResolveFn } from "@angular/router";
import { firstValueFrom } from "rxjs";

export interface Details {
  name: string;
  description: string;
  logoUrl: string;
  primaryColor: string;
  email: string;
  phone: string;
  address: string;
  publicUrl: string;
  adminUrl: string;
  seoTitle: string;
  seoDescription: string;
}
export interface Section {
  key: string;
  heading: string;
  text: string;
  imageUrl: string;
  imageAlt: string;
}
export interface Summary {
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
}
export interface PageData {
  site: {
    enabled: boolean;
    details?: Details;
    cmsEnabled?: boolean;
    contactEnabled?: boolean;
  };
  kind: string;
  sections?: Section[];
  blog?: {
    items: Summary[];
    total: number;
    pageNumber: number;
    pageSize: number;
  };
  article?: { summary: Summary; html: string };
}
export const pageResolver: ResolveFn<PageData> = async (_route, state) => {
  const http = inject(HttpClient);
  const transfer = inject(TransferState);
  const context = inject(REQUEST_CONTEXT) as { page?: PageData } | null;
  const response = inject(RESPONSE_INIT);
  const key = makeStateKey<PageData>("website:" + state.url);
  let data: PageData;
  if (context?.page) {
    data = context.page;
    transfer.set(key, data);
  } else if (transfer.hasKey(key)) {
    data = transfer.get(key, { site: { enabled: false }, kind: "coming-soon" });
    transfer.remove(key);
  } else {
    const url = new URL(state.url, "https://website.invalid");
    try {
      data = await firstValueFrom(
        http.get<PageData>("/_site/page", {
          params: {
            path: url.pathname,
            page: url.searchParams.get("page") ?? "1",
          },
        }),
      );
    } catch {
      data = { site: { enabled: false }, kind: "unavailable" };
    }
  }
  if (response) {
    response.status =
      data.kind === "not-found" ? 404 : data.kind === "unavailable" ? 503 : 200;
    response.headers = {
      "Cache-Control": "no-store",
      ...(!data.site.enabled || data.kind === "not-found"
        ? { "X-Robots-Tag": "noindex, nofollow" }
        : {}),
    };
  }
  return data;
};
