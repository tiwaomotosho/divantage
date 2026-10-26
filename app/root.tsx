import { isRouteErrorResponse, Link, Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation } from "react-router";
import type { Route } from "./+types/root";
// Doc 29 §4 order: fonts, tokens, components. The app adds no styling of its own.
import "../design/fonts/fonts.css";
import "../design/tokens/tokens.css";
import "../design/components/da.css";
import { Footer, Header, HelperBar, SignInSheet, TabBar, useHelperBarVisible } from "./components/Shell";
import { SuggestSheet } from "./components/SuggestSheet";
import { EmptyState, Icon, Toaster } from "./components/da";
import { useEffect, useState } from "react";
import { BRAND } from "./lib/build";

// No-flash theme (06 §8). Its SHA-256 is added to the per-page CSP by scripts/postbuild.ts.
const THEME_SCRIPT = `try{var t=localStorage.getItem("da-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/assets/brand/favicon.svg", type: "image/svg+xml" },
  { rel: "icon", href: "/assets/brand/favicon.ico", sizes: "any" },
  { rel: "apple-touch-icon", href: "/assets/brand/apple-touch-icon.png" },
  { rel: "manifest", href: "/assets/brand/manifest.webmanifest" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <Meta />
        <Links />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function Main({ children }: { children: React.ReactNode }) {
  const helper = useHelperBarVisible();
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    // Offline support (S25): keep opened pages for reading without a connection.
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const on = () => setOffline(!navigator.onLine);
    on();
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", on);
    };
  }, []);
  return (
    <main id="main" className={helper ? "has-helper" : undefined}>
      {offline && (
        <div className="banner" role="status" style={{ borderRadius: 0, justifyContent: "center", background: "var(--da-color-warning-soft)" }}>
          <Icon name="wifi-off" /> Offline · showing saved pages
        </div>
      )}
      {children}
    </main>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <Main>
        <Outlet />
      </Main>
      <Footer />
      <HelperBar />
      <TabBar />
      <SuggestSheet />
      <SignInSheet />
      <Toaster />
    </>
  );
}

export function HydrateFallback() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="wrap" style={{ paddingTop: 28 }} aria-busy="true" aria-label="Loading">
          <div className="sk" style={{ height: 40, width: "60%" }} />
          <div className="sk" style={{ height: 18, width: "40%", marginTop: 14 }} />
          <div className="sk" style={{ height: 220, marginTop: 24 }} />
        </section>
      </main>
      <TabBar />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <>
      <Header />
      <main id="main">
        {notFound ? <NotFoundState /> : <ErrorState />}
      </main>
      <Footer />
      <TabBar />
    </>
  );
}

export function NotFoundState() {
  return (
    <EmptyState
      illustration="not-found"
      title="We couldn't find that page"
      body="It may have moved. Search, or start from who you are."
      actions={
        <>
          <Link className="btn p blk" to="/">
            Go home
          </Link>
          <Link className="btn s blk" to="/search">
            Search
          </Link>
        </>
      }
    />
  );
}

function ErrorState() {
  const loc = useLocation();
  return (
    <EmptyState
      illustration="error"
      title="Something went wrong on our side"
      body="It's not you. Please try again in a moment."
      refCode={`ERR-${Math.abs([...loc.pathname].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7)).toString(16).slice(0, 4)}`}
      actions={
        <>
          <button type="button" className="btn p blk" onClick={() => location.reload()}>
            Try again
          </button>
          <Link className="btn s blk" to={`/report?page=${encodeURIComponent(loc.pathname)}`}>
            Report a problem
          </Link>
        </>
      }
    />
  );
}

export const meta: Route.MetaFunction = () => [{ title: BRAND }];
