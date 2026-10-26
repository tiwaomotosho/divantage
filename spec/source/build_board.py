"""Concept Board V2.8 PDF assembled from the reference screenshots."""
import json, os, asyncio, base64
from icons import IC, svg, logo_mark
P = '/home/claude/patch/P'; PREV = '/home/claude/patch/build/prev'; B = '/home/claude/patch/build/board'
os.makedirs(B, exist_ok=True)
T = json.load(open(f'{P}/design/tokens/tokens.json'))
L, D = T['color']['light'], T['color']['dark']
S = json.load(open(f'{P}/design/reference/screens/screens.json'))
PH = json.load(open(f'{P}/assets/photos/manifest.json'))['photos']
VIS = json.load(open(f'{P}/assets/maps/taxonomy-visuals.json'))

CSS = f'''@import url('../../P/design/fonts/fonts.css');
@page {{ size: 1600px 1000px; margin: 0 }}
*{{box-sizing:border-box;margin:0;padding:0}} body{{font-family:Inter;color:{L['ink']};-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.pg{{width:1600px;height:1000px;position:relative;overflow:hidden;page-break-after:always;background:#F6F3EE;padding:52px 64px 0}}
.pg.dk{{background:#0E0C1A;color:#F4F1EA}}
.hd{{display:flex;justify-content:space-between;font:600 12px Inter;letter-spacing:.14em;text-transform:uppercase;color:#6A6780;margin-bottom:14px}}
.dk .hd{{color:#A39FB5}}
h1{{font:700 40px/1.08 'Schibsted Grotesk';letter-spacing:-.02em;max-width:1300px}}
.sub{{font-size:17px;line-height:1.5;color:#55526B;margin-top:8px;max-width:1150px}} .dk .sub{{color:#BDB9CC}}
.ft{{position:absolute;left:64px;right:64px;bottom:20px;display:flex;justify-content:space-between;font:500 11px Inter;color:#8E8A99}}
.row{{display:flex;gap:28px;align-items:flex-start}}
.shot{{border-radius:14px;overflow:hidden;box-shadow:0 24px 50px -18px rgba(22,20,43,.35),0 0 0 1px rgba(22,20,43,.08);background:#fff;flex:none}}
.shot img{{display:block;width:100%}}
.ph{{border-radius:40px;padding:8px;background:#0B0A12;box-shadow:0 24px 50px -16px rgba(22,20,43,.45);flex:none}} .ph img{{display:block;border-radius:32px;width:100%}}
.lbl{{font:600 12px Inter;color:#6A6780;text-align:center;margin-top:10px}} .dk .lbl{{color:#A39FB5}}
.note{{background:#fff;border:1px solid #E3DCD0;border-radius:16px;padding:18px 20px;font-size:14px;line-height:1.5;color:#35324A}}
.dk .note{{background:#1B1930;border-color:#36334F;color:#D9D5E6}}
.note h4{{font:700 15px Inter;margin-bottom:8px;color:inherit}}
.note li{{margin:6px 0 6px 18px}}
.chip{{display:inline-block;font:600 11px Inter;padding:5px 9px;border-radius:99px;background:#16142B;color:#fff;margin-right:6px}}
.pill{{display:inline-block;font:700 11px Inter;padding:4px 8px;border-radius:6px;background:#FFE9E2;color:#9E3519}}
table{{border-collapse:collapse;width:100%;font-size:14px}} td,th{{text-align:left;padding:10px 12px;border-bottom:1px solid #E3DCD0;vertical-align:top}} th{{font:700 12px Inter;letter-spacing:.06em;text-transform:uppercase;color:#6A6780}}
'''
def img64(path):
    return 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode()
def rel(p): return os.path.relpath(p, B)
pages = []
def page(sec, title, sub, body, dark=False):
    n = len(pages) + 1
    pages.append(f'<section class="pg {"dk" if dark else ""}"><div class="hd"><span>{sec}</span><span>{n:02d}</span></div><h1>{title}</h1>' + (f'<p class="sub">{sub}</p>' if sub else '') + f'<div style="margin-top:26px">{body}</div><div class="ft"><span>Digital Advantage · Concept Board V2.8 · reference screens rendered from design/reference</span><span>26 Oct 2026</span></div></section>')

# cover
pages.append(f'''<section class="pg dk" style="padding:0;display:flex"><div style="width:760px;padding:70px 64px;display:flex;flex-direction:column">
<div style="display:flex;gap:12px;align-items:center"><span style="width:48px;height:48px;border-radius:14px;background:#A797FF;color:#16142B;display:flex;align-items:center;justify-content:center">{logo_mark(28)}</span><span style="font:700 24px 'Schibsted Grotesk'">Digital Advantage</span></div>
<div style="margin-top:auto"><div style="font:600 12px Inter;letter-spacing:.14em;color:#A797FF">UI/UX CONCEPT BOARD · V2.8 · AFTER PILOT ROUND 1</div>
<h1 style="font-size:66px;line-height:1.03;margin-top:18px;color:#fff">Find the tools people in your job use. <span style="color:#A797FF">Learn them step by step.</span></h1>
<p style="font-size:18px;line-height:1.55;color:#BDB9CC;margin-top:20px;max-width:560px">27 responsive reference screens built in code with the real tokens, a complete asset library and the checks that keep the build true to the concept.</p></div>
<div style="margin-top:40px;font-size:12px;color:#7F7B95">Patch for Product Pack V2.7 · Concept imagery generated with Microsoft Copilot</div></div>
<div style="flex:1;background:url({rel(P+'/assets/photos/remote-worker/remote-worker-portrait-960.jpg')}) center/cover"></div></section>''')

# what changed
rows = [('Promise unclear (LMS? outsourcing?)', 'One promise as the H1: find the tools for your job, learn them step by step', 'D-104'), ('Path not "written for me" (8/17 neutral)', 'Job-specific paths first; DepthLabel on every path; general guides say so', 'D-094'), ('Next step unclear (7/17 neutral)', 'NextStepCard ends every content page', 'D-092'), ('Stuck opening a path (2/17)', '"Learn {tool}" on every tool row and tool page', 'D-092'), ('Trust neutral (6/17)', 'TrustLine: price + Checked date or Preview, everywhere', 'D-093'), ('"Loud colours, too much information"', 'Colour budget, one primary button per view, more space, no infinite motion', 'D-095'), ('Helper bar confusing (4/17)', 'Explainer banner + first-run coach mark + hide', 'D-100'), ('iPhone text cut off; dead button', 'Overflow guard, reserved space for fixed bars, dead-control test', 'D-101'), ('Needs only partly match (8/17)', '👍/👎 "Right for your work?" on each need', 'D-102'), ('More occupations wanted', '"Suggest my role" on browse and no-match', 'D-103')]
page('What changed', 'What the pilot told us, and what changed', '17 responses · NPS −6 · core value works (15/17 learned a new tool) · the gaps are personal relevance, next steps, trust and calm.',
     '<table><tr><th>We heard</th><th>V2.8 change</th><th>Decision</th></tr>' + ''.join(f'<tr><td>{a}</td><td><b>{b}</b></td><td><span class="chip">{c}</span></td></tr>' for a, b, c in rows) + '</table>')
# principles
pr = [('For my job, first', 'Job-specific content before general content. General is labelled.'), ('Always a next step', 'Every page ends with one NextStepCard.'), ('Calm by default', '≤ 3 hues, 1 primary button per view, generous space.'), ('Honest, visibly', 'Price, checks and depth labels are UI, not fine print.'), ('Explain once', 'New patterns get one sentence, the first time only.'), ('Phone first, nothing cut off', 'Designed at 390 px; fixed bars never cover content.'), ('Inclusive', 'WCAG 2.2 AA, 24 px minimum targets, plain English.')]
page('Principles', 'Seven principles for V2.8', None, '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">' + ''.join(f'<div class="note" style="padding:22px"><div style="font:700 34px Schibsted Grotesk;color:#4B2BD6">P{k+1}</div><h4 style="font-size:18px;margin-top:6px">{t}</h4><div>{d}</div></div>' for k, (t, d) in enumerate(pr)) + '</div>')
# colours
def sw(C):
    keys = ['canvas', 'surface', 'surface-sunken', 'border', 'ink', 'ink-muted', 'primary', 'primary-soft', 'secondary', 'secondary-soft', 'accent', 'highlight', 'success', 'warning', 'error', 'info']
    return '<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:10px">' + ''.join(f'<div><div style="height:70px;border-radius:14px;background:{C[k]};border:1px solid rgba(128,128,128,.25)"></div><div style="font:700 12px Inter;margin-top:6px">{k}</div><div style="font:500 11px IBM Plex Mono;opacity:.7">{C[k]}</div></div>' for k in keys) + '</div>'
page('Visual system', 'Colour: tokens are law', 'Same values as design/tokens/tokens.json. Category hues appear only in small tiles and tags (D-095).', f'<div style="font:700 13px Inter;margin-bottom:10px">LIGHT</div>{sw(L)}<div style="font:700 13px Inter;margin:22px 0 10px">DARK</div>{sw(D)}')
page('Visual system', 'Type, shape and the V2.8 components', 'Schibsted Grotesk for headings, Inter for reading, IBM Plex Mono for references (D-091).',
     f'''<div class="row"><div class="note" style="flex:1"><div style="font:700 60px/1.05 'Schibsted Grotesk';letter-spacing:-.025em">Tools for nurses</div><div style="font:700 30px 'Schibsted Grotesk';margin-top:14px">Get a remote job that pays in dollars</div><div style="font:700 21px Inter;margin-top:14px">Tools for this goal</div><div style="font:400 17px/1.6 Inter;margin-top:10px;color:#55526B">Real employers don't charge you to apply or to be hired. Check the company before you share documents.</div><div style="font:600 11px Inter;letter-spacing:.12em;margin-top:14px;color:#6A6780">STEP 1 · WHO ARE YOU?</div><div style="font:600 14px IBM Plex Mono;margin-top:10px">DA-7K2Q-91</div></div>
<div class="note" style="width:620px"><h4>New in V2.8 (see screens)</h4><ul><li><b>NextStepCard</b>: ink card, one action, last block of every content page</li><li><b>Learn {{tool}}</b> button on every tool row</li><li><b>TrustLine</b>: price chip + Checked date / Preview</li><li><b>DepthLabel</b>: For your job · In depth · General guide</li><li><b>Need feedback</b>: 👍/👎 "Right for your work?"</li><li><b>Helper explainer + coach mark</b></li><li><b>Suggest my role</b></li><li><b>Trust strip</b> on home</li></ul><p style="margin-top:10px">Radii: card 20 · input 16 · tile 12 · tag 7 · sheet 28 · pill</p></div></div>''')

NOTES = {
 '01-home': ['New promise H1 (D-104)', '6 example chips instead of 8', 'Trust strip and 3-step "How it works"', 'Photo mosaic on desktop only, to keep the phone light'],
 '02-home-picked': ['Up to 3 role chips, "2 of 3" counter', 'Step 2 need chips appear only after a role is picked'],
 '03-search': ['Kit is the best match', '"We understood" panel builds trust in the result', 'Safety note beside job/money results'],
 '04-identity': ['"Tools for nurses" (D-106)', 'DepthLabel on each need', '👍/👎 need feedback (D-102)', 'NextStepCard opens a job-specific path'],
 '05-browse': ['Sector cards use the taxonomy visual map', '"Suggest my role" (D-103)'],
 '06-goals': ['Compete / Grow / Scale as cards', 'Groups capped at 3–4 items with See all'],
 '07-goal': ['Learn button on every tool (D-092)', 'TrustLine on every tool (D-093)', 'DepthLabel per tool path', 'NextStepCard = next kit step'],
 '08-goal-safety-sheet': ['Bottom sheet on phone, dialog on desktop', 'Focus trapped, Esc closes'],
 '09-kits': ['Two photo features, the rest as icon tiles (calm)'],
 '10-kit': ['Photo hero with tokenised scrim', 'Stepper: done / now / next', 'Kids safety note pinned'],
 '11-tool': ['Price and checks box with Preview explainer', 'Paths for your job listed first', 'Learn button + NextStepCard'],
 '12-tool-unavailable': ['Availability banner under the header (D-074)'],
 '13-roadmap': ['"Written for nurses" depth label', 'Outcome + practice + time per module'],
 '14-roadmap-general': ['"General guide" label + explainer', 'Job chips and "Ask for my job" (FR-113)'],
 '15-helper': ['"What is a helper?" banner (D-100)', 'First-run coach mark on the helper bar', 'Bar never covers content'],
 '16-workbench': ['Continue card', 'Suggestions say why: "Rules, not AI"'],
 '17-sign-in': ['Sheet over context, never a wall', 'Google + email link, 18+ note'],
 '18-consent': ['All three switches off by default'],
 '19-privacy': ['Dates per consent, export and delete'],
 '20-suggest-edit': ['Reason chips, link, email opt-in with retention'],
 '21-status-whats-new': ['Public timeline and change log'],
 '22-trending': ['Opt-in counts, minimum group size'],
 '23-how-we-review': ['Explains the three labels people now see everywhere'],
 '24-not-found': ['Illustration + 2 ways forward'], '25-offline': ['Saved pages still work'], '26-error': ['Reference code for support'], '27-no-results': ['Out-of-scope query handled kindly'],
}
for fid, meta in S.items():
    dl, pl, pd = f'{PREV}/{fid}--desktop-light.jpg', f'{PREV}/{fid}--phone-light.jpg', f'{PREV}/{fid}--phone-dark.jpg'
    body = f'''<div class="row"><div><div class="shot" style="width:860px"><img src="{rel(dl)}"></div><div class="lbl">Desktop 1440 · light</div></div>
<div><div class="ph" style="width:236px"><img src="{rel(pl)}"></div><div class="lbl">Phone 390 · light</div></div>
<div><div class="ph" style="width:236px"><img src="{rel(pd)}"></div><div class="lbl">Phone · dark</div></div></div>
<div class="note" style="position:absolute;left:64px;right:64px;bottom:50px;display:flex;gap:18px;align-items:center"><span class="chip">{meta['screen']}</span><span class="chip" style="background:#4B2BD6">design/reference/screens/{fid}.html</span><span>{" · ".join(NOTES.get(fid, []))}</span></div>'''
    page(f'Screen · {meta["screen"]}', meta['title'], None, body)
# dark showcases
for fid in ['07-goal', '16-workbench', '15-helper', '11-tool']:
    page(f'Dark mode · {S[fid]["screen"]}', f'{S[fid]["title"]} in dark mode', 'Dark is designed as its own theme: lifted surfaces, borders instead of shadows, softer accents.',
         f'<div class="shot" style="width:1380px;height:770px;margin:0 auto"><img src="{rel(f"{PREV}/{fid}--desktop-dark.jpg")}" style="height:100%;object-fit:cover;object-position:top"></div>', dark=True)
# tablet
page('Tablet', 'Tablet: the same files at 834 px', 'No separate tablet design: the reference CSS reflows to 2–3 columns with the top bar and no tab bar.',
     '<div class="row" style="justify-content:center">' + ''.join(f'<div><div class="ph" style="width:300px;border-radius:30px"><img src="{rel(f"{PREV}/{f}--tablet-light.jpg")}" style="border-radius:22px"></div><div class="lbl">{S[f]["title"]}</div></div>' for f in ['01-home', '07-goal', '10-kit', '16-workbench']) + '</div>')
# assets
pics = ''.join(f'<div><div style="height:150px;border-radius:14px;background:url({rel(P+f"/assets/photos/{k}/{k}-card-480.jpg")}) center/cover"></div><div style="font:600 12px Inter;margin-top:6px">{k} <span class="pill">{v["tier"]}</span></div></div>' for k, v in PH.items())
page('Asset library', 'Photos: 11 subjects, 4 crops, 3 formats, LQIP', 'Used only through <Picture slug>. Tier A = 1536 px sources. Tier B = crops from one collage; replace before public launch.', f'<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:14px">{pics}</div>')
icons = ''.join(f'<div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:10px;background:#fff;border:1px solid #E3DCD0"><span style="width:24px;height:24px;display:block">{svg(n, size=24)}</span><span style="font:500 9px IBM Plex Mono;color:#6A6780">{n}</span></div>' for n in IC)
page('Asset library', f'Icons: {len(IC)} on one grid', '24 px, 2 px round stroke, currentColor. SVG files, sprite, TS module and <Icon> component. Icon libraries are blocked by the lint.', f'<div style="display:grid;grid-template-columns:repeat(18,1fr);gap:6px">{icons}</div>')
tools = ['canva', 'microsoft-excel', 'chatgpt', 'capcut', 'remote4africa', 'linkedin', 'upwork', 'scratch', 'code-org', 'python', 'notion', 'figma', 'power-bi', 'davinci-resolve', 'bandlab', 'audiomack', 'wise', 'raenest', 'jobscan', 'replit', 'arduino', 'whatsapp-business', 'zoom', 'coursera']
tl = ''.join(f'<img src="{rel(P+f"/assets/tool-logos/monogram/{t}.svg")}" style="width:64px;height:64px;border-radius:16px">' for t in tools)
ill = ''.join(f'<div style="text-align:center"><img src="{rel(P+f"/assets/illustrations/{k}-light.svg")}" style="width:150px"><div style="font:500 11px IBM Plex Mono;color:#6A6780">{k}</div></div>' for k in json.load(open(f'{P}/assets/illustrations/index.json')))
kit = ''.join(f'<span style="display:inline-flex;gap:6px;align-items:center;margin:0 8px 8px 0;padding:6px 10px;border-radius:10px;background:{T["category-hue"][v["hue"]]["light"][0]};color:{T["category-hue"][v["hue"]]["light"][1]};font:600 12px Inter">{svg(v["icon"], size=14)} {v["title"]}</span>' for v in VIS['kits'].values())
page('Asset library', 'Tool logos, illustrations and the taxonomy visual map', '1,781 tool monograms (one per registry tool) · 12 illustrations × light/dark · every kit, sector, skill group and intent has a fixed icon and hue.',
     f'<div style="display:flex;flex-wrap:wrap;gap:12px">{tl}</div><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-top:20px">{ill}</div><div style="margin-top:16px">{kit}</div>')
og = ''.join(f'<img src="{rel(P+f"/assets/og/{k}.png")}" style="width:600px;border-radius:12px;box-shadow:0 10px 30px -10px rgba(0,0,0,.3)">' for k in ['og-default', 'og-kit-template', 'og-goal-template', 'og-tool-template'])
page('Asset library', 'Brand kit and share images', 'Logo mark, outlined wordmark, favicons (SVG with dark mode, ICO), PWA and maskable icons, web manifest and four 1200×630 OG images.', f'<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;justify-items:center">{og}</div>')
# fidelity
locks = [('L1', 'One source of values', 'tokens.json → generated CSS/TS/Tailwind; drift fails CI'), ('L2', 'Same stylesheet', 'App imports da.css; components reuse class names and data-da'), ('L3', 'Closed asset set', 'Only these fonts, photos, icons, logos, illustrations'), ('L4', 'Static lint', 'check-design.mjs: raw colours, fonts, icon libs, external images'), ('L5', 'Runtime audit', 'design-audit.mjs: components, styles, overflow, targets, fonts'), ('L6', 'Owner sign-off', 'Side-by-side report; SIGNOFF.md'), ('L7', 'No silent regressions', 'Approved screenshots become visual tests')]
page('Fidelity', 'What stops the build drifting from this board', 'You can\'t make drift impossible, but V2.8 makes it blocked by CI and visible in review (doc 29).',
     '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">' + ''.join(f'<div class="note" style="padding:22px"><div style="font:700 30px Schibsted Grotesk;color:#4B2BD6">{a}</div><h4 style="font-size:17px;margin-top:6px">{b}</h4><div>{c}</div></div>' for a, b, c in locks) + '<div class="note" style="padding:22px;background:#16142B;color:#fff;border:0"><h4 style="font-size:17px">Self-test passes</h4><div>The audit runs on these reference screens: 27 screens × phone/desktop × light/dark = 108 checks, 0 failures.</div></div></div>')
pages.append('<section class="pg dk" style="display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center"><h1 style="font-size:58px;color:#fff;max-width:1000px">Find the tools people in your job use. <span style="color:#A797FF">Learn them step by step.</span></h1><p class="sub" style="margin-top:20px">Concept Board V2.8 · open design/reference/screens/index.html to see every screen live</p></section>')
open(f'{B}/board.html', 'w').write(f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{"".join(pages)}</body></html>')

async def m():
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1228/chrome-linux64/chrome', args=['--allow-file-access-from-files'])
        pg = await b.new_page(viewport={'width': 1600, 'height': 1000})
        await pg.goto(f'file://{B}/board.html'); await pg.wait_for_timeout(1500)
        await pg.pdf(path=f'{B}/Concept_Board_V2_8.pdf', width='1600px', height='1000px', print_background=True, prefer_css_page_size=True)
        els = await pg.query_selector_all('.pg')
        for k in [0, 1, 7, 13, 40]:
            if k < len(els): await els[k].screenshot(path=f'{B}/p{k+1:02d}.png')
        await b.close()
asyncio.run(m()); print('pages', len(pages))
