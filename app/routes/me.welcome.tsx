// S46 Consent (reference 18-consent): three switches, all off until chosen (FR-086). Demo account on this device.
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/me.welcome";
import { meta as pageMeta } from "../lib/build";
import { Icon, Prog, Tile } from "../components/da";
import { openSignIn } from "../components/Shell";
import { accountActions, useAccount, useHydrated } from "../lib/store";

export const meta: Route.MetaFunction = () => pageMeta("You decide what we keep", undefined, { noindex: true });

const ROWS = [
  { key: "progress", icon: "bookmark", title: "Save my progress", body: "Stars, ticks and kit steps sync to your account." },
  { key: "recommend", icon: "sparkles", title: "Use my profile to suggest things", body: "Suggestions based on your roles and skills. Rules, not AI." },
  { key: "trending", icon: "trending-up", title: "Count me in what's trending", body: "Anonymous weekly counts only. Never your name." },
] as const;

export default function Consent() {
  const account = useAccount();
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const [on, setOn] = useState<Record<string, boolean>>({ progress: false, recommend: false, trending: false });
  const save = () => {
    const at = new Date().toISOString();
    const c = (k: string) => ({ on: on[k], at: on[k] ? at : null });
    accountActions.setConsents({ progress: c("progress"), recommend: c("recommend"), trending: c("trending") });
    navigate("/me");
  };
  return (
    <section className="wrap" style={{ paddingTop: 28, maxWidth: 640 }}>
      <div className="row g6">
        <Prog className="pr fl1" value={1} style={{ height: 4 }} />
        <Prog className="pr fl1" value={1} style={{ height: 4 }} />
        <Prog className="fl1" value={0} style={{ height: 4 }} />
      </div>
      <h1 className="t-h1" style={{ marginTop: 22 }}>
        You decide what we keep
      </h1>
      <p className="mu" style={{ marginTop: 6 }}>
        Everything is off until you turn it on. You can change this any time in Profile.
      </p>
      {hydrated && !account && (
        <div className="banner info" style={{ marginTop: 16 }}>
          <Icon name="info" />
          <div className="fl1 t-sm">
            You're not signed in.{" "}
            <button type="button" className="pr b6" style={{ minHeight: 24 }} onClick={openSignIn}>
              Sign in
            </button>{" "}
            to choose these settings.
          </div>
        </div>
      )}
      <div className="col g12" style={{ marginTop: 20 }}>
        {ROWS.map((r) => (
          <div key={r.key} className="card pad row g12 as" data-da="consent-row">
            <Tile icon={r.icon} hue="violet" size="sm" />
            <div className="fl1">
              <div className="b7 t-sm">{r.title}</div>
              <div className="t-xs mu" style={{ marginTop: 3 }}>
                {r.body}
              </div>
            </div>
            <button type="button" className="sw" role="switch" aria-checked={on[r.key]} aria-label={r.title} onClick={() => setOn({ ...on, [r.key]: !on[r.key] })} />
          </div>
        ))}
      </div>
      {account ? (
        <button type="button" className="btn p blk lg" style={{ marginTop: 22 }} onClick={save}>
          Continue
        </button>
      ) : (
        <Link className="btn p blk lg" style={{ marginTop: 22 }} to="/me">
          Continue
        </Link>
      )}
      <p className="t-xs su" style={{ textAlign: "center", marginTop: 10 }}>
        Nothing is shared until you choose. Preview: your account is a demo kept on this device.
      </p>
    </section>
  );
}
