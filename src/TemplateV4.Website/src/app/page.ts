import { DOCUMENT, DatePipe } from "@angular/common";
import { Component, effect, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { Title, Meta } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { PageData, Section } from "./site";

@Component({
  selector: "app-page",
  imports: [RouterLink, DatePipe, FormsModule],
  template: `
    @if (data().site.enabled && data().site.details; as business) {
      <div class="site" [style.--brand]="business.primaryColor">
        <a class="skip" href="#main">Skip to content</a>
        <header class="header wrap">
          <a class="brand" routerLink="/"
            ><img
              [src]="business.logoUrl"
              alt=""
              width="40"
              height="40"
            /><span>{{ business.name }}</span></a
          >
          <nav aria-label="Main navigation">
            <a routerLink="/">Home</a><a routerLink="/blog">Journal</a
            ><a routerLink="/contact">Contact</a>
          </nav>
          <a class="signin" [href]="business.adminUrl + '/login'"
            >Sign in <span aria-hidden="true">↗</span></a
          >
        </header>
        <main id="main">
          @switch (data().kind) {
            @case ("home") {
              <section class="hero wrap">
                <div>
                  <p class="eyebrow">
                    A thoughtful approach. A practical difference.
                  </p>
                  <h1>{{ section("hero").heading }}</h1>
                  <p class="lead">{{ section("hero").text }}</p>
                  <a class="button" routerLink="/contact"
                    >Let’s start a conversation
                    <span aria-hidden="true">↗</span></a
                  >
                  <p class="small">
                    Good work starts with understanding your goals.
                  </p>
                </div>
                <div class="hero-art">
                  @if (section("hero").imageUrl) {
                    <img
                      [src]="section('hero').imageUrl"
                      [alt]="section('hero').imageAlt"
                      width="640"
                      height="720"
                      fetchpriority="high"
                    />
                  } @else {
                    <div class="arch" aria-hidden="true">
                      <span></span><i></i>
                    </div>
                    <div class="art-caption">
                      <span>Perspective.<br />Purpose.<br />Progress.</span
                      ><span aria-hidden="true">↗</span>
                    </div>
                  }
                </div>
              </section>
              <section class="intro wrap">
                <p class="eyebrow">A partner for what’s next</p>
                <h2>{{ section("about").heading }}</h2>
                <p>{{ section("about").text }}</p>
                @if (section("about").imageUrl) {
                  <img
                    class="section-image"
                    [src]="section('about').imageUrl"
                    [alt]="section('about').imageAlt"
                    loading="lazy"
                    width="1000"
                    height="500"
                  />
                }
              </section>
              <section class="services">
                <div class="wrap">
                  <p class="eyebrow">How we can help</p>
                  <div class="section-title">
                    <h2>{{ section("services").heading }}</h2>
                    <p>{{ section("services").text }}</p>
                  </div>
                  <div class="cards">
                    <article>
                      <span class="number">01 / Discover</span>
                      <h3>Find your direction.</h3>
                      <p>
                        We take time to understand your business, your
                        challenges and the opportunities ahead.
                      </p>
                    </article>
                    <article>
                      <span class="number">02 / Shape</span>
                      <h3>Make a practical plan.</h3>
                      <p>
                        Bring your priorities into focus with a clear approach
                        and achievable next steps.
                      </p>
                    </article>
                    <article>
                      <span class="number">03 / Deliver</span>
                      <h3>Move forward together.</h3>
                      <p>
                        Turn ideas into action with thoughtful support and open
                        communication.
                      </p>
                    </article>
                  </div>
                  @if (section("services").imageUrl) {
                    <img
                      class="section-image"
                      [src]="section('services').imageUrl"
                      [alt]="section('services').imageAlt"
                      loading="lazy"
                      width="1000"
                      height="500"
                    />
                  }
                </div>
              </section>
              <section class="values wrap">
                <p class="eyebrow">Our commitment</p>
                <h2>{{ section("testimonials").heading }}</h2>
                <p>{{ section("testimonials").text }}</p>
                @if (section("testimonials").imageUrl) {
                  <img
                    class="section-image"
                    [src]="section('testimonials').imageUrl"
                    [alt]="section('testimonials').imageAlt"
                    loading="lazy"
                    width="1000"
                    height="500"
                  />
                }
              </section>
              <section class="cta wrap">
                <div>
                  <p class="eyebrow">Let’s talk</p>
                  <h2>{{ section("contact").heading }}</h2>
                  <p>{{ section("contact").text }}</p>
                </div>
                <a class="button" routerLink="/contact"
                  >Get in touch <span aria-hidden="true">↗</span></a
                >
              </section>
            }
            @case ("blog") {
              <section class="wrap page-heading">
                <p class="eyebrow">The journal</p>
                <h1>Ideas for the road ahead.</h1>
                <p class="lead">
                  Perspectives, practical advice and news from our team.
                </p>
              </section>
              <section class="wrap blog-grid" aria-label="Articles">
                @for (post of data().blog?.items ?? []; track post.slug) {
                  <article>
                    <p class="eyebrow">
                      {{ post.publishedAt | date: "longDate" }}
                    </p>
                    <h2>
                      <a [routerLink]="'/blog/' + post.slug">{{
                        post.title
                      }}</a>
                    </h2>
                    <p>{{ post.excerpt }}</p>
                    <a [routerLink]="'/blog/' + post.slug"
                      >Read article <span aria-hidden="true">↗</span></a
                    >
                  </article>
                } @empty {
                  <p>No articles published yet. Check back soon.</p>
                }
              </section>
              @if (data().blog; as blog) {
                <nav class="wrap pagination" aria-label="Blog pages">
                  @if (blog.pageNumber > 1) {
                    <a
                      routerLink="/blog"
                      [queryParams]="{ page: blog.pageNumber - 1 }"
                      >← Previous</a
                    >
                  }
                  @if (blog.pageNumber * blog.pageSize < blog.total) {
                    <a
                      routerLink="/blog"
                      [queryParams]="{ page: blog.pageNumber + 1 }"
                      >Next →</a
                    >
                  }
                </nav>
              }
            }
            @case ("article") {
              @if (data().article; as article) {
                <article class="wrap article">
                  <a routerLink="/blog">← Back to journal</a>
                  <p class="eyebrow">
                    {{ article.summary.publishedAt | date: "longDate" }} ·
                    {{ article.summary.author }}
                  </p>
                  <h1>{{ article.summary.title }}</h1>
                  <p class="lead">{{ article.summary.excerpt }}</p>
                  <div class="prose" [innerHTML]="article.html"></div>
                </article>
              }
            }
            @case ("contact") {
              <section class="wrap contact">
                <div>
                  <p class="eyebrow">We’d like to hear from you</p>
                  <h1>Good things start with a conversation.</h1>
                  <p class="lead">Tell us what you have in mind.</p>
                  <address>
                    <a [href]="'mailto:' + business.email">{{
                      business.email
                    }}</a
                    ><a [href]="'tel:' + business.phone">{{
                      business.phone
                    }}</a>
                    <p>{{ business.address }}</p>
                  </address>
                </div>
                <div class="form-panel">
                  @if (data().site.contactEnabled) {
                    @if (sent()) {
                      <div role="status">
                        <h2>Thank you for getting in touch.</h2>
                        <p>
                          Your enquiry has been received. Our team will follow
                          up with you.
                        </p>
                      </div>
                    } @else {
                      <form #form="ngForm" (ngSubmit)="form.valid && submit()">
                        <h2>Send an enquiry</h2>
                        <label for="name">Your name</label
                        ><input
                          id="name"
                          name="name"
                          [(ngModel)]="name"
                          required
                          maxlength="120"
                          autocomplete="name"
                        /><label for="email">Email address</label
                        ><input
                          id="email"
                          name="email"
                          [(ngModel)]="email"
                          required
                          email
                          maxlength="254"
                          type="email"
                          autocomplete="email"
                        /><label for="message">How can we help?</label
                        ><textarea
                          id="message"
                          name="message"
                          [(ngModel)]="message"
                          required
                          maxlength="5000"
                          rows="6"
                        ></textarea>
                        <div class="honey" aria-hidden="true">
                          <label for="website">Leave this field empty</label
                          ><input
                            id="website"
                            name="website"
                            [(ngModel)]="website"
                            tabindex="-1"
                            autocomplete="off"
                          />
                        </div>
                        <p class="small">
                          We’ll use these details to respond to your enquiry.
                        </p>
                        @if (error()) {
                          <p role="alert">{{ error() }}</p>
                        }
                        <button
                          class="button"
                          type="submit"
                          [disabled]="busy() || form.invalid"
                        >
                          {{ busy() ? "Sending…" : "Send enquiry" }}
                        </button>
                      </form>
                    }
                  } @else {
                    <h2>Get in touch directly</h2>
                    <p>
                      Please use the email address or phone number listed here
                      to contact our team.
                    </p>
                  }
                </div>
              </section>
            }
            @default {
              <section class="wrap page-heading">
                <p class="eyebrow">404</p>
                <h1>We couldn’t find that page.</h1>
                <a class="button" routerLink="/">Back to home</a>
              </section>
            }
          }
        </main>
        <footer class="footer wrap">
          <a class="brand" routerLink="/">{{ business.name }}</a>
          <p>{{ business.description }}</p>
          <nav aria-label="Footer">
            <a routerLink="/blog">Journal</a><a routerLink="/contact">Contact</a
            ><a [href]="business.adminUrl + '/login'">Admin sign in ↗</a>
          </nav>
          <p class="small">© {{ year }} {{ business.name }}</p>
        </footer>
      </div>
    } @else {
      <main class="coming">
        <div class="coming-mark" aria-hidden="true">↗</div>
        <p class="eyebrow">A new chapter is on its way</p>
        <h1>Coming soon.</h1>
        <p>
          We’re putting the finishing touches on our website.<br />Please check
          back soon.
        </p>
        @if (data().kind === "unavailable") {
          <p role="status">The website is temporarily unavailable.</p>
        }
      </main>
    }
  `,
})
export class Page {
  private readonly route = toSignal(inject(ActivatedRoute).data);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly http = inject(HttpClient);
  readonly year = new Date().getFullYear();
  readonly busy = signal(false);
  readonly sent = signal(false);
  readonly error = signal("");
  name = "";
  email = "";
  message = "";
  website = "";
  data(): PageData {
    return (
      this.route()?.["page"] ?? {
        site: { enabled: false },
        kind: "coming-soon",
      }
    );
  }
  section(key: string): Section {
    const d = this.data().site.details!;
    const fallback: Record<string, [string, string]> = {
      hero: [d.name + ". Here for your next chapter.", d.description],
      about: [
        "People first. Purpose always.",
        "We believe the best outcomes begin with a shared understanding. Our approach combines a fresh perspective with care for the details that matter to you.",
      ],
      services: [
        "From possibility to progress.",
        "A considered approach, shaped around your business and the work ahead.",
      ],
      testimonials: [
        "Built on listening. Strengthened by trust.",
        "Clear communication, practical thinking and care in everything we do. That’s the standard we bring to every conversation.",
      ],
      contact: [
        "What’s your next chapter?",
        "Let’s explore how we can help you move forward.",
      ],
    };
    return (
      this.data().sections?.find((x) => x.key === key) ?? {
        key,
        heading: fallback[key][0],
        text: fallback[key][1],
        imageUrl: "",
        imageAlt: "",
      }
    );
  }
  constructor() {
    effect(() => {
      const data = this.data();
      const d = data.site.details;
      const title =
        data.kind === "article"
          ? data.article!.summary.title
          : data.kind === "blog"
            ? "Journal"
            : data.kind === "contact"
              ? "Contact"
              : data.kind === "not-found"
                ? "Page not found"
                : d?.seoTitle;
      this.title.setTitle(
        d
          ? data.kind === "home"
            ? title!
            : title + " | " + d.name
          : "Coming soon",
      );
      const description =
        data.article?.summary.excerpt ??
        d?.seoDescription ??
        "Our new website is coming soon.";
      this.meta.updateTag({ name: "description", content: description });
      this.meta.updateTag({
        name: "robots",
        content:
          !d || data.kind === "not-found"
            ? "noindex, nofollow"
            : "index, follow",
      });
      this.document.querySelector('link[rel="canonical"]')?.remove();
      this.document.querySelector("#website-structured-data")?.remove();
      if (!d) return;
      const path =
        data.kind === "article"
          ? "/blog/" + data.article!.summary.slug
          : data.kind === "blog"
            ? "/blog"
            : data.kind === "contact"
              ? "/contact"
              : "/";
      const url =
        d.publicUrl.replace(/\/$/, "") +
        path +
        (data.kind === "blog" && (data.blog?.pageNumber ?? 1) > 1
          ? "?page=" + data.blog!.pageNumber
          : "");
      const link = this.document.createElement("link");
      link.rel = "canonical";
      link.href = url;
      this.document.head.appendChild(link);
      for (const [property, content] of Object.entries({
        "og:title": this.title.getTitle(),
        "og:description": description,
        "og:url": url,
        "og:type": data.kind === "article" ? "article" : "website",
        "og:image": new URL(d.logoUrl, d.publicUrl).href,
      }))
        this.meta.updateTag({ property, content });
      this.meta.updateTag({ name: "twitter:card", content: "summary" });
      const schema =
        data.kind === "article"
          ? {
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: data.article!.summary.title,
              datePublished: data.article!.summary.publishedAt,
              dateModified: data.article!.summary.updatedAt,
              author: { "@type": "Person", name: data.article!.summary.author },
              mainEntityOfPage: url,
            }
          : {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: d.name,
              url: d.publicUrl,
              logo: new URL(d.logoUrl, d.publicUrl).href,
              email: d.email,
              telephone: d.phone,
              address: d.address,
            };
      const script = this.document.createElement("script");
      script.id = "website-structured-data";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema).replace(/</g, "\\u003c");
      this.document.head.appendChild(script);
    });
  }
  async submit() {
    this.busy.set(true);
    this.error.set("");
    try {
      await firstValueFrom(
        this.http.post("/_site/contact", {
          name: this.name,
          email: this.email,
          message: this.message,
          website: this.website,
        }),
      );
      this.sent.set(true);
    } catch {
      this.error.set(
        "We couldn’t send your enquiry. Please wait a moment and try again, or contact us by email.",
      );
    } finally {
      this.busy.set(false);
    }
  }
}
