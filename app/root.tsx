import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration, Link } from "react-router";
import type { Route } from "./+types/root";
import "@fontsource-variable/atkinson-hyperlegible-next/wght.css";
import "@fontsource-variable/bricolage-grotesque/wght.css";
import "./styles/tokens.css";
import "./styles/app.css";
import { BetaBanner, BottomTabBar, Footer, Header } from "./components/Shell";
import { HelperPanel } from "./components/HelperPanel";
import { SuggestSheet } from "./components/SuggestSheet";
import { BRAND } from "./lib/build";

// No-flash theme (06 §8). Its SHA-256 is added to the per-page CSP by scripts/csp-hashes.ts.
const THEME_SCRIPT = `try{var t=localStorage.getItem("da-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="color-scheme" content="light dark" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <Meta />
        <Links />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <BetaBanner />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <HelperPanel />
      <BottomTabBar />
      <SuggestSheet />
    </>
  );
}

export function HydrateFallback() {
  return (
    <>
      <Header />
      <main id="main" className="container">
        <div className="skeleton-page" aria-busy="true" aria-label="Loading" />
      </main>
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <>
      <Header />
      <main id="main" className="container narrow">
        <div className="empty-state">
          <svg width="120" height="80" viewBox="0 0 120 80" aria-hidden="true" className="motif">
            <path d="M10 60 C 40 60, 40 20, 70 20 S 100 50, 110 30" />
            <circle cx="10" cy="60" r="6" />
            <circle cx="110" cy="30" r="6" />
          </svg>
          <h1>{notFound ? "We couldn't find that page" : "Something went wrong"}</h1>
          <p>{notFound ? "The link may be old, or the page may have moved." : "Please try again. If it keeps happening, tell us."}</p>
          <div className="form-actions">
            <Link className="btn btn-primary" to="/">
              Go to the home page
            </Link>
            <Link className="btn btn-secondary" to="/who-are-you">
              Browse everyone
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export const meta: Route.MetaFunction = () => [{ title: BRAND }];
