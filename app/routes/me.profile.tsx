// S46 Privacy and data (reference 19-privacy): consent switches with dates, what we store, download, delete.
// Signed in (demo account) or device-only.
import { useState } from "react";
import type { Route } from "./+types/me.profile";
import { meta as pageMeta } from "../lib/build";
import { Icon, toast } from "../components/da";
import { openSignIn } from "../components/Shell";
import {
  accountActions,
  deviceActions,
  getAccount,
  getDevice,
  getHelper,
  getIdentities,
  getRetention,
  getTicks,
  helperActions,
  identityActions,
  useAccount,
  useDevice,
  useHydrated,
  useIdentityMemory,
  useTicks,
  type Account,
} from "../lib/store";
import { shortDate } from "~/lib/view";

export const meta: Route.MetaFunction = () => pageMeta("Privacy and data", undefined, { noindex: true });

const ROWS: { key: keyof NonNullable<Account["consents"]>; title: string; body: string }[] = [
  { key: "progress", title: "Save my progress", body: "Stars, ticks and kit steps sync to your account." },
  { key: "recommend", title: "Use my profile to suggest things", body: "Roles and skills shape suggestions. Rules only, no AI." },
  { key: "trending", title: "Count me in what's trending", body: "Adds your goal views to anonymous weekly counts." },
];

export default function Privacy() {
  const hydrated = useHydrated();
  const account = useAccount();
  const dev = useDevice();
  const mem = useIdentityMemory();
  const ticks = useTicks();
  const [confirm, setConfirm] = useState(false);
  const roles = mem?.slugs.length ?? 0;
  const stars = Object.keys(dev?.stars ?? {}).length;
  const tickCount = Object.values(ticks?.ticks ?? {}).reduce((a, m) => a + Object.values(m).filter(Boolean).length, 0);
  const consents = account?.consents ?? { progress: { on: false, at: null }, recommend: { on: false, at: null }, trending: { on: false, at: null } };

  const toggle = (k: keyof typeof consents) => {
    if (!account) return openSignIn();
    const now = !consents[k].on;
    accountActions.setConsents({ ...consents, [k]: { on: now, at: now ? new Date().toISOString() : null } });
    toast(now ? "Turned on." : "Turned off.");
  };
  const download = () => {
    const blob = new Blob([JSON.stringify({ exported: new Date().toISOString(), account: getAccount(), roles: getIdentities(), device: getDevice(), ticks: getTicks(), helper: getHelper(), activity: getRetention() }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "digital-advantage-my-data.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const wipe = () => {
    if (!confirm) return setConfirm(true);
    identityActions.forget();
    helperActions.clearAll();
    deviceActions.clear();
    accountActions.signOut();
    setConfirm(false);
    toast(account ? "Your account and data were deleted." : "Everything was deleted from this device.");
  };

  return (
    <section className="wrap" style={{ paddingTop: 28, maxWidth: 820 }}>
      <span className="t-label">Settings</span>
      <h1 className="t-h1" style={{ marginTop: 4 }}>
        Privacy and data
      </h1>
      <p className="mu" style={{ marginTop: 6 }}>
        You decide what we keep. Everything here was off until you chose it.
      </p>
      {hydrated && account ? (
        <div className="row g12 wrapf t-sm" style={{ marginTop: 12 }}>
          <span className="av" aria-hidden="true">
            {account.name[0]}
          </span>
          <div className="fl1">
            <b>{account.name}</b> · {account.email}
            <div className="t-xs su">
              Signed in with {account.method === "google" ? "Google" : "an email link"} · Preview: demo account kept on this device
            </div>
          </div>
          <button type="button" className="btn s sm" onClick={() => accountActions.signOut()}>
            <Icon name="logout" /> Sign out
          </button>
        </div>
      ) : (
        hydrated && (
          <div className="banner info" style={{ marginTop: 14 }}>
            <Icon name="info" />
            <div className="fl1 t-sm">
              You're not signed in, so everything stays on this device.{" "}
              <button type="button" className="pr b6" style={{ minHeight: 24 }} onClick={openSignIn}>
                Sign in
              </button>{" "}
              to keep it everywhere.
            </div>
          </div>
        )
      )}
      <div className="card" style={{ marginTop: 20, padding: "4px 20px" }}>
        <div className="list">
          {ROWS.map((r) => {
            const c = consents[r.key];
            return (
              <div key={r.key} className="row g16" style={{ padding: "16px 0" }} data-da="consent-row">
                <div className="fl1">
                  <div className="b7">{r.title}</div>
                  <div className="t-sm mu">{r.body}</div>
                  <div className="t-xs su" style={{ marginTop: 4 }}>
                    {hydrated && c.on && c.at ? `Turned on ${shortDate(c.at.slice(0, 10))}` : "Off"}
                  </div>
                </div>
                <button type="button" className="sw" role="switch" aria-checked={hydrated && c.on} aria-label={r.title} onClick={() => toggle(r.key)} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="card pad" style={{ marginTop: 14 }}>
        <h2 className="t-h4">What we store</h2>
        <div className="grid c2 t-sm" style={{ marginTop: 10 }}>
          {[
            account ? `Your email and sign-in method` : "No email: you're not signed in",
            `Roles you picked (${hydrated ? roles : 0})`,
            `Stars (${hydrated ? stars : 0}) and ticks (${hydrated ? tickCount : 0})`,
            "Your choices above, with dates",
          ].map((x) => (
            <div key={x} className="row g8">
              <span className="se">
                <Icon name="check" />
              </span>
              {x}
            </div>
          ))}
        </div>
        <div className="row g8 t-sm mu" style={{ marginTop: 12 }}>
          <Icon name="info" /> Activity is deleted after 90 days. We never sell data or show ads.
        </div>
      </div>
      <div className="row g12 wrapf" style={{ marginTop: 16 }}>
        <button type="button" className="btn s" onClick={download}>
          <Icon name="download" /> Download my data
        </button>
        <button type="button" className="btn s" style={{ color: "var(--da-color-error)", borderColor: "var(--da-color-error)" }} onClick={wipe}>
          <Icon name="trash" /> {confirm ? "Tap again to confirm" : account ? "Delete my account" : "Delete everything on this device"}
        </button>
      </div>
    </section>
  );
}
