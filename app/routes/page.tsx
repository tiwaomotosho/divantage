// S15–S17, S20–S23 About and policy pages. Legal text is the owner's to write (D-027): placeholders are marked TODO(owner).
import { Link, useLocation } from "react-router";
import type { Route } from "./+types/page";
import { BRAND, meta as pageMeta } from "../lib/build";
import { Callout, PageHeader } from "../components/ui";
import type { ReactNode } from "react";

const TODO = ({ what }: { what: string }) => (
  <Callout tone="warning" title="TODO(owner)">
    <p>{what} This text needs the owner's approval before public launch (D-027).</p>
  </Callout>
);

const PAGES: Record<string, { title: string; lead: string; body: ReactNode }> = {
  "/about": {
    title: `About ${BRAND}`,
    lead: "A free, non-commercial guide that helps people move from “I need to do something” to “I know which tools to use, how to use them and what to do next.”",
    body: (
      <>
        <p>
          Start with who you are. Every one of more than 2,600 professions and life roles has a toolkit: the needs of that work, the tools that meet them, and a
          beginner-to-expert course outline for each tool, adjusted to the work.
        </p>
        <p>We don't sell anything. There are no ads, sponsors, affiliate links or paid placements. Who you are and your progress stay on your device.</p>
        <p>
          Much of the content was drafted with AI assistance and is labelled with its review status. People who know the work are checking it. If something is
          wrong, <Link to="/suggest">suggest an edit</Link>.
        </p>
      </>
    ),
  },
  "/about/editorial-standards": {
    title: "Editorial standards",
    lead: "How we choose tools and stay independent.",
    body: (
      <>
        <ul className="bullets">
          <li>We include tools because they fit people's needs, never because a company asked or paid. We have no commercial relationships with any tool.</li>
          <li>Lists are sorted by fit or A–Z. That is an editorial default, not a quality ranking.</li>
          <li>Facts (prices, platforms, features) come from official sources and show the date we checked them. Our opinions are labelled “Our view”.</li>
          <li>Tools we haven't profiled yet show only their name and official link. We don't guess prices or features.</li>
          <li>We never link to video platforms or embed third-party media.</li>
        </ul>
        <TODO what="Final wording of the non-commercial and independence statement." />
      </>
    ),
  },
  "/about/how-we-review": {
    title: "Verification and freshness",
    lead: "How we check facts and keep them current.",
    body: (
      <>
        <h2 id="pricing-labels">What the price labels mean</h2>
        <ul className="bullets">
          <li>
            <strong>Free</strong>: everything is free to use.
          </li>
          <li>
            <strong>Free tier + paid plans</strong>: a usable free tier exists alongside paid plans.
          </li>
          <li>
            <strong>Free trial</strong>: free for a limited time, then paid.
          </li>
          <li>
            <strong>Open source</strong>: the source code is openly licensed.
          </li>
          <li>
            <strong>Price not confirmed</strong>: we haven't verified the price yet.
          </li>
        </ul>
        <h2 id="platforms">Platforms</h2>
        <p>We list platforms only after checking an official source. Until then the page says “Platform not confirmed”.</p>
        <h2>Review intervals</h2>
        <p>Prices are re-checked about every 90 days and guides about once a year. Pages show when they were last reviewed, and overdue pages say so.</p>
        <h2>Expert review</h2>
        <p>Every profession, need, course outline and lens shows its expert-review status. “Pending” means a practitioner hasn't checked it yet.</p>
      </>
    ),
  },
  "/contact": {
    title: "Contact and help",
    lead: "The fastest way to reach us is the “Suggest an edit” button on any page.",
    body: (
      <>
        <p>
          To report a wrong price or broken link, use <Link to="/report">Report an issue</Link>.
        </p>
        <TODO what="Contact email address for the project." />
      </>
    ),
  },
  "/privacy": {
    title: "Privacy notice",
    lead: "Who you are and your progress never leave your device.",
    body: (
      <>
        <ul className="bullets">
          <li>Your chosen identities, roadmap ticks and helper progress are stored only in your browser (localStorage). We never receive them.</li>
          <li>We don't use tracking cookies or accounts.</li>
          <li>We count page views and a few anonymous actions in aggregate, without cookies or personal data.</li>
          <li>If you send a suggestion, we receive what you type, the page address and, if you choose, a name to thank you with.</li>
        </ul>
        <TODO what="Full privacy notice: controller, lawful basis, retention, rights and contact." />
      </>
    ),
  },
  "/terms": { title: "Terms of use", lead: "", body: <TODO what="Terms of use, including the CC BY 4.0 licence for text and the disclaimer for third-party tools." /> },
  "/accessibility": {
    title: "Accessibility statement",
    lead: "We aim to meet WCAG 2.2 AA.",
    body: (
      <>
        <p>The site works with a keyboard and screen readers, supports light and dark themes, respects reduced motion and reflows down to 320 px wide.</p>
        <p>
          Found a problem? <Link to="/report?type=accessibility">Tell us</Link>.
        </p>
        <TODO what="Formal statement: conformance status, known issues and the date of the last audit." />
      </>
    ),
  },
};

export const meta: Route.MetaFunction = ({ location }) => pageMeta(PAGES[location.pathname]?.title ?? BRAND, PAGES[location.pathname]?.lead);

export default function Page() {
  const { pathname } = useLocation();
  const p = PAGES[pathname] ?? PAGES["/about"];
  return (
    <div className="container narrow">
      <PageHeader title={p.title} lead={p.lead || undefined} />
      <div className="prose">{p.body}</div>
    </div>
  );
}
