// S15, S16, S20–S23 About and policy pages. Legal text is the owner's to write (D-027): placeholders say TODO(owner).
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import type { Route } from "./+types/page";
import { BRAND, meta as pageMeta } from "../lib/build";
import { Icon } from "../components/da";

const TODO = ({ what }: { what: string }) => (
  <div className="banner err">
    <Icon name="alert" />
    <div className="fl1 t-sm">
      <b>TODO(owner):</b> {what} This needs the owner's approval before public launch (D-027).
    </div>
  </div>
);

const P = ({ children }: { children: ReactNode }) => <p className="mu" style={{ marginTop: 10 }}>{children}</p>;

const PAGES: Record<string, { label: string; title: string; lead: string; body: ReactNode }> = {
  "/about": {
    label: "Our mission",
    title: `About ${BRAND}`,
    lead: "Find the tools people in your job use. Learn them step by step.",
    body: (
      <>
        <P>Start with who you are. Each of 2,603 jobs and life roles has the tools that matter for that work, a learning path for each tool, and one clear next step.</P>
        <P>We don't sell anything. No ads, sponsors, affiliate links or paid placement. Who you are and your progress stay on your device.</P>
        <P>
          Much of the content was drafted with AI and is labelled with its review status. People who know the work are checking it. If something is wrong, <Link className="pr b6" to="/suggest">suggest an edit</Link>.
        </P>
      </>
    ),
  },
  "/about/editorial-standards": {
    label: "Trust",
    title: "Editorial standards",
    lead: "How we choose tools and stay independent.",
    body: (
      <>
        <P>We include tools because they fit people's work, never because a company asked or paid. Lists are ranked by fit or sorted A–Z; that is not a quality ranking.</P>
        <P>Prices show "Checked" with a date only when confirmed on an official source. Everything else carries a Preview label. Our opinions are labelled "Our view".</P>
        <TODO what="Final wording of the non-commercial and independence statement." />
      </>
    ),
  },
  "/contact": {
    label: "Help",
    title: "Contact and help",
    lead: 'The fastest way to reach us is "Suggest an edit" on any page.',
    body: <TODO what="Contact email address for the project." />,
  },
  "/privacy": {
    label: "Privacy",
    title: "Privacy notice",
    lead: "Who you are and your progress never leave your device.",
    body: (
      <>
        <P>Your roles, stars, ticks, kit steps and helper progress are stored only in your browser. You can download or delete them in <Link className="pr b6" to="/me/profile">Privacy and data</Link>.</P>
        <P>We don't use tracking cookies or accounts in this version. If you send a suggestion, we receive what you type and the page address.</P>
        <TODO what="Full privacy notice: controller, lawful basis, retention, rights and contact." />
      </>
    ),
  },
  "/terms": { label: "Terms", title: "Terms of use", lead: "", body: <TODO what="Terms of use, including the CC BY 4.0 licence for text and the disclaimer for third-party tools." /> },
  "/accessibility": {
    label: "Accessibility",
    title: "Accessibility statement",
    lead: "We aim to meet WCAG 2.2 AA.",
    body: (
      <>
        <P>The site works with a keyboard and screen readers, supports light and dark themes, respects reduced motion and fits screens from 320 px wide.</P>
        <P>
          Found a problem? <Link className="pr b6" to="/report?type=accessibility">Tell us</Link>.
        </P>
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
    <section className="wrap" style={{ paddingTop: 28, maxWidth: 760 }}>
      <span className="t-label">{p.label}</span>
      <h1 className="t-h1" style={{ marginTop: 4 }}>
        {p.title}
      </h1>
      {p.lead && (
        <p className="t-lg mu" style={{ marginTop: 6 }}>
          {p.lead}
        </p>
      )}
      <div className="col g12" style={{ marginTop: 16 }}>
        {p.body}
      </div>
    </section>
  );
}
