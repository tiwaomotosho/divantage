# 27 — Pilot round 1: findings and what V2.8 changes because of them

**Source:** `Digital Advantage_ Feedback form (Responses) - Form Responses 1.csv` (17 responses, October 2026) and the form itself (`Digital Advantage_ Feedback form - Google Forms.pdf`).
**Status:** evidence for decisions D-091 to D-104 (doc 31) and the brief (doc 28).

## 1. Who took part
| | Count |
|---|---|
| Responses | 17 |
| Employed / self-employed / looking for work / prefer not to say | 13 / 2 / 1 / 1 |
| iPhone / Android / laptop | 12 / 4 / 1 |
| Digital confidence: very / fairly | 8 / 9 (nobody "not confident") |
| Willing to be contacted again | 14 |

**Caveat:** a friendly, confident, mostly corporate, mostly iPhone sample, recruited through the owner. Core audiences (students, nurses, farmers, traders, people who are not confident with digital tools, mid-range Android) are missing. Treat the results as a ceiling, not a forecast.

## 2. Results
| Measure | Result | Signal |
|---|---|---|
| Task 1, find your role | 17/17 easy · 13 exact match, 4 close | Identity entry works |
| Needs under "Core to your work" match my job | 9 mostly · **8 partly** | Close but not precise |
| Clear what to do first | 13 agree · 1 disagree · 1 neutral · 2 blank | OK |
| Looks modern and trustworthy | 11 agree · 5 neutral · 1 disagree | Fine, not premium |
| Task 2, open a learning path | 15 easy · **2 stuck** | Path entry not obvious |
| Learning path felt written for me | **8 agree · 8 neutral** · 1 blank | Weakest result |
| I know my next step | 10 agree · **7 neutral** | Pages end without a next action |
| Task 3, helpers | 14 easy · 1 with difficulty · **2 stuck** | Hardest task |
| Helper bar | 13 helpful · 2 didn't understand · 1 didn't see · 1 in the way | Needs explaining |
| Easy to use | 11 agree · 6 neutral | — |
| Fast and fits my screen | 15 agree · 2 neutral | Not a problem |
| I trust the information | 11 agree · **6 neutral** | Trust evidence missing |
| Learned about a new tool | 15 agree · 2 neutral | **Core value works** |
| Bugs | 1 text cut off / covered (Accountant, iPhone) · 1 button did nothing (EA, iPhone) | Fix first |
| Likely to recommend (0–10) | mean 7.1 · 3 promoters, 10 passives, 4 detractors → **NPS −6** | Liked, not loved |

## 3. What people said
- **What the site is for:** most said "find the right digital tools for my work". Others said "like an LMS", "outsourcing", "professional support", "learning digital skills", "upgrading your corporate skills". The promise is not landing as one idea.
- **Change one thing:** "loud colours, too much information on a page, it could be cleaner" (securities trader) · "just twist the UI" (product designer) · "more occupations should be listed" (entrepreneur).
- **Liked:** easy clicks, response time, user friendly, easy to navigate, informative, apt and useful.

## 4. Detractors (scores 3–6) and their cause
| Who | Score | What went wrong | V2.8 answer |
|---|---|---|---|
| Accountant, iPhone | 5 | Stuck on Tasks 2 and 3, didn't understand the helper bar, **text cut off** | D-092 Learn button, D-100 helper explainer, D-101 no-overlap shell |
| BA, Android | 5 | Stuck on helpers, didn't see the helper bar, disagreed it looks modern | D-100, D-095 calm visual system |
| Securities trader, iPhone | 5 | Loud colours, too much on a page | D-095 colour and density budget |
| Unnamed, Android | 3 | Stuck on Task 2, close match only, needs only partly matched | D-092, D-102 need feedback, D-103 suggest-my-role |

## 5. Findings → changes (summary; detail in doc 28)
| # | Finding | Change in V2.8 | Decision |
|---|---|---|---|
| F1 | Promise unclear | One promise everywhere: "Find the tools people in your job use. Learn them step by step." | D-104 |
| F2 | Learning path not "for me" | Depth labels on every path (For your job · In depth · General guide); job-specific paths shown first; general guides say so and let people ask for their job | D-094 |
| F3 | Next step unclear | `NextStepCard` is the last block of identity, goal, tool, path, kit and helper pages | D-092 |
| F4 | Stuck opening a path | "Learn {tool}" button on every tool row and tool page | D-092 |
| F5 | Trust neutral | Trust line (price + Checked date or Preview) on every tool mention; "How we review" one tap away | D-093 |
| F6 | Loud, busy | Colour budget (≤ 3 category hues, 1 primary button per view), fewer items above the fold, more space | D-095 |
| F7 | Helper bar confusing | First-run coach mark (one sentence, Got it / Hide), explainer banner on helper pages, bar never covers content | D-100 |
| F8 | iPhone text cut off; dead button | Overflow guard, safe-area padding, `main` reserves tab-bar + helper-bar space, every control wired; audits fail the build | D-101 |
| F9 | Needs only partly match | 👍/👎 "Right for your work?" on each need, feeding curation | D-102 |
| F10 | Want more occupations | "Can't find your job? Suggest my role" on browse and no-match | D-103 |

## 6. Round 2 plan (targets)
Recruit 15–20 people: at least 10 on mid-range Android, at least 6 who rate themselves "not very confident", and at least 8 outside office jobs (nurse, trader, farmer, teacher, student, driver, artisan). Re-invite 5 round-1 people to measure change. Use `qa/pilot-round-2-form.md`.

| Metric | Round 1 | Target round 2 |
|---|---|---|
| Learning path felt written for me (agree) | 8/17 (47%) | ≥ 70% |
| I know my next step (agree) | 10/17 (59%) | ≥ 80% |
| I trust the information (agree) | 11/17 (65%) | ≥ 75% |
| Looks modern and trustworthy (agree) | 11/17 (65%) | ≥ 80% |
| Anyone stuck on any task | 4 instances | 0 |
| Layout bugs reported | 2 | 0 |
| NPS | −6 | ≥ +20 |
| People who describe the site as "find and learn the tools for my job" | 10/17 (59%) | ≥ 80% |
