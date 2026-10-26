// V2.8 component library (doc 29 §5). Same class names and data-da attributes as design/reference/screens.
// Styles come only from design/components/da.css and tokens (no local styling).
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router";
import { ICONS } from "../generated/icons";
import photos from "../generated/photos.json";
import overrides from "../generated/logo-overrides.json";
import type { Depth, Trust } from "~/lib/view";
import { deviceActions, useDevice, useHydrated, type StarItem } from "../lib/store";

export type IconName = keyof typeof ICONS;

// ---------- Icon, logo, photo, illustration (closed asset set, doc 29 L3) ----------

export function Icon({ name, size, label, className }: { name: string; size?: number; label?: string; className?: string }) {
  const svg = (ICONS as Record<string, string>)[name] ?? ICONS["help"];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={name === "play" ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-da-icon={name}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function BrandMark() {
  return (
    <span className="mark">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="4 17 9 12 13 15 20 7" />
        <circle cx="20" cy="7" r="1.6" fill="currentColor" />
      </svg>
    </span>
  );
}

export function ToolLogo({ slug, size = "md" }: { slug: string; size?: "sm" | "md" | "lg" }) {
  const px = { sm: 32, md: 44, lg: 72 }[size];
  const src = (overrides as string[]).includes(slug) ? `/assets/tool-logos/overrides/${slug}.svg` : `/assets/tool-logos/monogram/${slug}.svg`;
  return <img className={`tl${size === "md" ? "" : ` ${size}`}`} data-da="tool-logo" src={src} alt="" width={px} height={px} loading="lazy" decoding="async" />;
}

type Ratio = "wide" | "card" | "square" | "portrait";
type PhotoEntry = { alt: string; focal: number[]; variants: Record<string, { widths: number[]; aspect: string; lqip: string }> };

/** <Picture> from assets/photos/manifest.json only (D-097). */
export function Picture({ slug, ratio = "card", sizes = "(min-width:1024px) 50vw, 100vw", priority, className, fill }: { slug: string; ratio?: Ratio; sizes?: string; priority?: boolean; className?: string; fill?: boolean }) {
  const p = (photos as Record<string, PhotoEntry>)[slug] ?? (photos as Record<string, PhotoEntry>)["remote-worker"];
  const v = p.variants[ratio] ?? p.variants.card;
  const name = (photos as Record<string, PhotoEntry>)[slug] ? slug : "remote-worker";
  const set = (ext: string) => v.widths.map((w) => `/assets/photos/${name}/${name}-${ratio}-${w}.${ext} ${w}w`).join(", ");
  const w = v.widths[v.widths.length - 1];
  const [a, b] = v.aspect.split("/").map(Number);
  const pictureStyle: CSSProperties = fill ? { display: "block", position: "absolute", inset: 0 } : { display: "block" };
  return (
    <picture className={className ?? (fill ? "" : "photo")} data-da="photo" data-da-slug={name} style={pictureStyle}>
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
      <img
        src={`/assets/photos/${name}/${name}-${ratio}-${v.widths[0]}.jpg`}
        srcSet={set("jpg")}
        sizes={sizes}
        alt={p.alt}
        width={w}
        height={Math.round((w * b) / a)}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${p.focal[0] * 100}% ${p.focal[1] * 100}%`, backgroundImage: `url(${v.lqip})`, backgroundSize: "cover" }}
      />
    </picture>
  );
}

export function Illustration({ name, width = 200, height = 150 }: { name: string; width?: number; height?: number }) {
  return (
    <picture data-da="illustration">
      <source media="(prefers-color-scheme: dark)" srcSet={`/assets/illustrations/${name}-dark.svg`} />
      <img src={`/assets/illustrations/${name}-light.svg`} alt="" width={width} height={height} style={{ margin: "0 auto" }} />
    </picture>
  );
}

// ---------- Small primitives ----------

export function Tile({ icon, hue, size }: { icon: string; hue: string; size?: "sm" | "lg" }) {
  return (
    <span className={`tile ${size ?? ""} h-${hue}`} aria-hidden="true">
      <Icon name={icon} />
    </span>
  );
}

export function Tag({ hue, icon, children, className, ...rest }: { hue?: string; icon?: string; children: ReactNode; className?: string; [k: string]: unknown }) {
  return (
    <span className={`tag ${hue ? `h-${hue}` : ""} ${className ?? ""}`} {...rest}>
      {icon && <Icon name={icon} />} {children}
    </span>
  );
}

export function Crumbs({ items }: { items: { to?: string; label: string }[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {items.map((it, i) => (
        <span key={i} className="row g6">
          {i > 0 && <Icon name="chevron-right" />}
          {it.to ? <Link to={it.to}>{it.label}</Link> : <span aria-current={i === items.length - 1 ? "page" : undefined}>{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

/** TrustLine (D-093): price + "Checked {date}" or "Preview", never one without the other. */
export function TrustLine({ trust }: { trust: Trust }) {
  return (
    <span className="trust" data-da="trust-line">
      <span className={`tag h-${trust.hue}`} data-da="price">
        {trust.price}
      </span>
      {trust.checked ? (
        <span className="tag vchk" data-da="verified">
          <Icon name="check" /> Checked {trust.checked}
        </span>
      ) : (
        <Link to="/about/how-we-review" className="tag vprev" data-da="preview-label" title={trust.partly ? `Partly checked: ${trust.partly}. Pricing is still a preview.` : "Drafted from general knowledge, not yet checked against the official site."}>
          <Icon name="eye" /> Preview
        </Link>
      )}
    </span>
  );
}

export function DepthLabel({ depth, icon }: { depth: Depth; icon?: boolean }) {
  return (
    <span className={`tag depth-${depth.kind}`} data-da="depth-label">
      {icon && depth.kind === "role" && <Icon name="check" />} {depth.label}
    </span>
  );
}

export interface NextStep {
  kicker: string;
  title: string;
  sub: string;
  url: string;
  cta: string;
}

/** NextStepCard (D-092): exactly one, the last content block. */
export function NextStepCard({ next, onClick }: { next: NextStep; onClick?: () => void }) {
  return (
    <section className="next" data-da="next-step" aria-label="Your next step">
      <div className="fl1">
        <div className="k">{next.kicker}</div>
        <div className="ttl">{next.title}</div>
        <div className="t-sm" style={{ opacity: 0.75, marginTop: 2 }}>
          {next.sub}
        </div>
      </div>
      {next.url.startsWith("#") ? (
        <button type="button" className="btn" onClick={onClick}>
          {next.cta} <Icon name="arrow-right" />
        </button>
      ) : (
        <Link className="btn" to={next.url} onClick={onClick}>
          {next.cta} <Icon name="arrow-right" />
        </Link>
      )}
    </section>
  );
}

export function SafetyNote({ s, compact }: { s: { icon: string; label: string; what: string; flags: string[]; help: string }; compact?: boolean }) {
  return (
    <div className="safe" data-da="safety-note">
      <div className="hd">
        <Icon name={s.icon} /> {s.label}
        <span className="fl1" />
        <span className="t-xs su" style={{ fontWeight: 500 }}>
          Safety note
        </span>
      </div>
      <div className="bd">
        {s.what}
        {!compact && (
          <>
            <div className="t-label" style={{ marginTop: 14 }}>
              Red flags
            </div>
            {s.flags.slice(0, 3).map((f) => (
              <div className="flag" key={f}>
                <Icon name="flag" />
                <span>{f}</span>
              </div>
            ))}
            {s.flags.length > 3 && (
              <details style={{ marginTop: 6 }}>
                <summary className="t-sm pr b6">{s.flags.length - 3} more</summary>
                {s.flags.slice(3).map((f) => (
                  <div className="flag" key={f}>
                    <Icon name="flag" />
                    <span>{f}</span>
                  </div>
                ))}
              </details>
            )}
            <div className="t-label" style={{ marginTop: 14 }}>
              Where to get help
            </div>
            <div className="mu" style={{ marginTop: 6 }}>
              {s.help}. Nothing here is financial, legal or medical advice.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Star toggle (device stars, D-079). Confirms with a toast. */
export function StarButton({ item, icon }: { item: Omit<StarItem, "at">; icon?: boolean }) {
  const dev = useDevice();
  const on = Boolean(dev?.stars[`${item.type}:${item.slug}`]);
  const label = on ? "Starred" : "Star";
  const click = () => {
    const now = deviceActions.toggleStar(item);
    toast(now ? "Starred. Saved on this device." : "Removed from your stars.", now ? { label: "Undo", run: () => deviceActions.toggleStar(item) } : undefined);
  };
  if (icon)
    return (
      <button type="button" className="ib" aria-label={`${label} ${item.label}`} aria-pressed={on} onClick={click}>
        <Icon name="star" />
      </button>
    );
  return (
    <button type="button" className="btn s" aria-pressed={on} onClick={click}>
      <Icon name="star" /> {label}
    </button>
  );
}

export function ShareButton({ title }: { title: string }) {
  return (
    <button
      type="button"
      className="btn s"
      onClick={async () => {
        try {
          if (navigator.share) await navigator.share({ title, url: location.href });
          else {
            await navigator.clipboard.writeText(location.href);
            toast("Link copied.");
          }
        } catch {
          /* cancelled */
        }
      }}
    >
      <Icon name="share" /> Share
    </button>
  );
}

// ---------- Tool row (S43) ----------

export function ToolRowCard({ t, rank, top, market }: { t: import("~/lib/view").ToolMention; rank: number; top?: boolean; market?: string }) {
  const off = market && t.notIn?.includes(market);
  return (
    <article className={`card pad ${top ? "el feat" : ""}`} data-da="tool-row">
      <div className="row g16 as">
        <span className="t-mono su t-sm desk" style={{ marginTop: 12 }}>
          {String(rank).padStart(2, "0")}
        </span>
        <ToolLogo slug={t.slug} />
        <div className="fl1">
          <div className="row g8 wrapf">
            <Link to={`/tools/${t.slug}`} className="b7" style={{ fontSize: "1.0625rem" }}>
              {t.name}
            </Link>
            {top && !off && (
              <Tag hue="violet" icon="star">
                Top pick
              </Tag>
            )}
            {off && (
              <Tag hue="coral" icon="alert">
                Not available here
              </Tag>
            )}
          </div>
          <div style={{ marginTop: 6 }}>
            <TrustLine trust={t.trust} />
          </div>
          {t.desc && (
            <p className="t-sm mu" style={{ marginTop: 8 }}>
              {t.desc}
            </p>
          )}
          <div className="row g8 wrapf" style={{ marginTop: 12 }}>
            <Link className={`btn ${top ? "p" : "s"} sm`} to={t.learn} data-da="learn-tool">
              <Icon name="route" /> Learn {t.name}
            </Link>
            {t.depth && <DepthLabel depth={t.depth} />}
            {t.url && (
              <a className="t-sm pr b6" href={t.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 4 }}>
                Official site <Icon name="external" />
              </a>
            )}
          </div>
        </div>
        <StarButton icon item={{ type: "tool", slug: t.slug, label: t.name }} />
      </div>
    </article>
  );
}

// ---------- Sheet (bottom sheet < 768, dialog ≥ 768) ----------

export function Sheet({ open, onClose, labelledBy, da, children }: { open: boolean; onClose: () => void; labelledBy: string; da: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const back = useRef<Element | null>(null);
  useEffect(() => {
    if (!open) return;
    back.current = document.activeElement;
    const el = ref.current;
    const focusables = () => [...(el?.querySelectorAll<HTMLElement>('button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])') ?? [])];
    focusables()[0]?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const f = focusables();
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
          e.preventDefault();
          f[0].focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    document.documentElement.setAttribute("data-sheet-open", "");
    return () => {
      document.removeEventListener("keydown", key);
      document.documentElement.removeAttribute("data-sheet-open");
      (back.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby={labelledBy} data-da={da} ref={ref}>
        <div className="grab" />
        {children}
      </div>
    </>
  );
}

// ---------- Toast ----------

type ToastMsg = { text: string; action?: { label: string; run: () => void } };
export function toast(text: string, action?: ToastMsg["action"]) {
  window.dispatchEvent(new CustomEvent<ToastMsg>("da:toast", { detail: { text, action } }));
}
export function Toaster() {
  const [msg, setMsg] = useState<ToastMsg | null>(null);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      setMsg((e as CustomEvent<ToastMsg>).detail);
      clearTimeout(t);
      t = setTimeout(() => setMsg(null), 4000);
    };
    window.addEventListener("da:toast", on);
    return () => window.removeEventListener("da:toast", on);
  }, []);
  if (!msg) return null;
  return (
    <div role="status" style={{ position: "fixed", left: 0, right: 0, bottom: 96, zIndex: 500, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div className="toast" style={{ pointerEvents: "auto" }}>
        {msg.text}
        {msg.action && (
          <button
            type="button"
            className="b7"
            onClick={() => {
              msg.action!.run();
              setMsg(null);
            }}
          >
            {msg.action.label}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------- Empty / error states (screens 24–27) ----------

export function EmptyState({ illustration, title, body, actions, refCode, h1 = true }: { illustration: string; title: string; body: string; actions: ReactNode; refCode?: string; h1?: boolean }) {
  const H = h1 ? "h1" : "h2";
  return (
    <section className="empty" data-da="state">
      <Illustration name={illustration} />
      <H className="t-h2" style={{ marginTop: 18 }}>
        {title}
      </H>
      <p className="mu" style={{ marginTop: 8 }}>
        {body}
      </p>
      <div className="col g10" style={{ marginTop: 22 }}>
        {actions}
      </div>
      {refCode && (
        <div className="t-xs su t-mono" style={{ marginTop: 16 }}>
          Ref: {refCode}
        </div>
      )}
    </section>
  );
}

export function FlagOff() {
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

/** Progress bar width set through the CSSOM (CSP-safe) as well as the hashed style attribute. */
export function Prog({ value, className, style, fill }: { value: number; className?: string; style?: CSSProperties; fill?: CSSProperties }) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <span className={`prog ${className ?? ""}`} style={{ display: "block", ...style }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
      <i style={{ width: `${pct}%`, ...fill }} />
    </span>
  );
}

export function useHydratedFlag() {
  return useHydrated();
}
