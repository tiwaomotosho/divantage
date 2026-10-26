// S17 How we review (reference 23-how-we-review): label meanings, 5-step pipeline, suggest-an-edit prompt.
import type { Route } from "./+types/how-we-review";
import { meta as pageMeta } from "../lib/build";
import { Icon, Illustration } from "../components/da";

export const meta: Route.MetaFunction = () => pageMeta("How we review", "Independent, checked and dated. What each label means.");

const STEPS = [
  ["Draft", "A person or AI writes it"],
  ["Check", "Facts checked against the official site"],
  ["Review", "A second person signs it off"],
  ["Publish", "Dated, with its source"],
  ["Re-check", "Every 90 days or when reported"],
];

export default function HowWeReview() {
  return (
    <section className="wrap" style={{ paddingTop: 28 }}>
      <span className="t-label">How we review</span>
      <h1 className="t-h1" style={{ marginTop: 4 }}>
        Independent, checked and dated
      </h1>
      <p className="t-lg mu" style={{ marginTop: 6, maxWidth: 700 }}>
        No ads, no affiliate links, no paid placement. Here is what each label means.
      </p>
      <div className="grid c3" style={{ marginTop: 14 }} id="pricing-labels">
        <div className="card pad">
          <span className="tag vchk">
            <Icon name="check" /> Checked 22 Oct 2026
          </span>
          <p className="t-sm mu" style={{ marginTop: 10 }}>
            We confirmed the price on a dated official source.
          </p>
        </div>
        <div className="card pad">
          <span className="tag vprev">
            <Icon name="eye" /> Preview
          </span>
          <p className="t-sm mu" style={{ marginTop: 10 }}>
            Written from general knowledge. Not checked yet. Prices, free-tier limits and availability in your country may differ. Confirm before you pay.
          </p>
        </div>
        <div className="card pad">
          <div className="row g6 wrapf">
            <span className="tag depth-role">For your job</span>
            <span className="tag depth-deep">In depth</span>
            <span className="tag depth-general">General guide</span>
          </div>
          <p className="t-sm mu" style={{ marginTop: 10 }}>
            How specific a learning path is to your work. General guides follow a proven template for that kind of tool.
          </p>
        </div>
      </div>
      <div className="card pad" style={{ marginTop: 16 }}>
        <div className="grid c4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
          {STEPS.map(([t, s], i) => (
            <div key={t}>
              <div className="t-h1 hl">{i + 1}</div>
              <div className="b7" style={{ marginTop: 4 }}>
                {t}
              </div>
              <div className="t-sm mu">{s}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card pad" style={{ marginTop: 16 }} id="platforms">
        <h2 className="t-h4">Where the content comes from today</h2>
        <p className="t-sm mu" style={{ marginTop: 6 }}>
          Most tool profiles are drafted from general knowledge and carry the Preview label until an editor checks the official pricing page. Every profession, need and learning path also shows its expert-review status. Nothing is hidden because it isn't checked yet: it's labelled instead.
        </p>
      </div>
      <div className="banner info" style={{ marginTop: 16 }}>
        <Illustration name="trust-review" width={120} height={90} />
        <div className="fl1">
          <b>See something wrong?</b> <span className="mu">Every page has "Suggest an edit". You get a reference number, and a person reviews it.</span>
        </div>
      </div>
    </section>
  );
}
