"""Reference screens (V2.8). Each file is ONE responsive page: the same markup renders phone, tablet and desktop.
Output: P/design/reference/screens/<id>.html"""
import json, os
from icons import svg, logo_mark

P = '/home/claude/patch/P'
OUT = f'{P}/design/reference/screens'; os.makedirs(OUT, exist_ok=True)
R = '../../..'  # to patch root from screens dir
TL = json.load(open(f'{P}/assets/tool-logos/index.json'))['tools']
PH = json.load(open(f'{P}/assets/photos/manifest.json'))['photos']
VIS = json.load(open(f'{P}/assets/maps/taxonomy-visuals.json'))
NAME2SLUG = {v['name']: k for k, v in TL.items()}

def tl(name, size=''):
    s = NAME2SLUG.get(name) or name.lower().replace(' ', '-')
    if s not in TL: raise SystemExit(f'tool logo missing: {name}')
    return f'<img class="tl {size}" data-da="tool-logo" src="{R}/assets/tool-logos/monogram/{s}.svg" alt="" width="44" height="44">'

def pic(slug, ratio='card', cls='photo', style='', sizes='(min-width:1024px) 50vw, 100vw', eager=False):
    p = PH[slug]; v = p['variants'][ratio]
    def ss(ext): return ', '.join(f'{R}/assets/photos/{slug}/{slug}-{ratio}-{w}.{ext} {w}w' for w in v['widths'])
    w = v['widths'][-1]; a, b = map(int, v['aspect'].split('/'))
    fx, fy = p['focal']
    return (f'<picture class="{cls}" data-da="photo" data-da-slug="{slug}" style="display:block;{style}">'
            f'<source type="image/avif" srcset="{ss("avif")}" sizes="{sizes}"><source type="image/webp" srcset="{ss("webp")}" sizes="{sizes}">'
            f'<img src="{R}/assets/photos/{slug}/{slug}-{ratio}-{v["widths"][0]}.jpg" srcset="{ss("jpg")}" sizes="{sizes}" alt="{p["alt"]}" width="{w}" height="{round(w*b/a)}" '
            f'loading="{"eager" if eager else "lazy"}" style="width:100%;height:100%;object-fit:cover;object-position:{fx*100:.0f}% {fy*100:.0f}%;background:{p["dominant"]}"></picture>')

def ill(name, w=200):
    return f'<picture data-da="illustration"><source media="(prefers-color-scheme: dark)" srcset="{R}/assets/illustrations/{name}-dark.svg"><img src="{R}/assets/illustrations/{name}-light.svg" alt="" width="{w}" height="{int(w*.75)}" style="margin:0 auto"></picture>'

def tile(icon, hue, size=''):
    return f'<span class="tile {size} h-{hue}" aria-hidden="true">{svg(icon)}</span>'

def star(on=False):
    st = ' style="fill:var(--da-color-highlight);stroke:var(--da-color-highlight)"' if on else ''
    return svg('star', extra=st)

PRICE = {'free': ('Free', 'h-green'), 'freemium': ('Free plan + paid', 'h-teal'), 'paid': ('Paid · trial', 'h-slate'), 'usage': ('Pay per use', 'h-blue'), 'open': ('Open source', 'h-green')}
def trust(price, checked=None):
    t, c = PRICE[price]
    v = (f'<span class="tag vchk" data-da="verified">{svg("check")} Checked {checked}</span>' if checked
         else f'<span class="tag vprev" data-da="preview-label">{svg("eye")} Preview</span>')
    return f'<span class="trust" data-da="trust-line"><span class="tag {c}" data-da="price">{t}</span>{v}</span>'

# ------------------------------------------------------------------ chrome
NAV = [('Explore', 'explore'), ('Goals', 'goals'), ('Kits', 'kits'), ('Skills', 'skills'), ('Helpers', 'helpers')]
def header(active='', signed=False):
    n = ''.join(f'<a href="#" {"aria-current=page" if k == active else ""}>{t}</a>' for t, k in NAV)
    right = (f'<a class="ib" href="#" aria-label="Notifications">{svg("bell")}</a><span class="av" aria-label="Your account">TO</span>' if signed
             else '<a class="btn s sm" href="#" data-da="sign-in-link">Sign in</a>')
    return f'''<a class="skip" href="#main">Skip to content</a>
<header class="hdr" data-da="header"><div class="wrap in">
 <div class="row g32"><a class="brand" href="#" aria-label="Digital Advantage home"><span class="mark">{logo_mark()}</span><span class="wm">Digital Advantage</span><span class="beta">Beta</span></a><nav aria-label="Main">{n}</nav></div>
 <div class="row g10"><a class="q" href="#" data-da="global-search">{svg("search")}<span class="fl1">I want to…</span><span class="kbd">⌘K</span></a>
 <a class="ib mq" href="#" aria-label="Search">{svg("search")}</a><button class="ib" data-da="theme-toggle" aria-label="Switch theme">{svg("moon")}</button>{right}</div>
</div></header>'''

def tabbar(active):
    items = [('home', 'Home', 'home'), ('compass', 'Explore', 'explore'), ('target', 'Goals', 'goals'), ('layers', 'Kits', 'kits'), ('user', 'Me', 'me')]
    return '<nav class="tabbar" data-da="tabbar" aria-label="Main">' + ''.join(f'<a href="#" {"aria-current=page" if k == active else ""}>{svg(ic)}{t}</a>' for ic, t, k in items) + '</nav>'

def footer():
    cols = [('Explore', ['Goals', 'Kits', 'Skills', 'Helpers', 'Browse everyone']), ('Trust', ['How we review', 'Suggest an edit', "What's new"]), ('About', ['Our mission', 'Contributors', 'Privacy'])]
    c = ''.join(f'<div class="col g10"><span class="b7 t-sm">{h}</span>' + ''.join(f'<a class="t-sm mu" href="#">{x}</a>' for x in xs) + '</div>' for h, xs in cols)
    return f'''<footer class="ftr desk" data-da="footer"><div class="wrap row sb as"><div class="col g12" style="max-width:340px"><span class="brand"><span class="mark">{logo_mark()}</span><span class="wm">Digital Advantage</span></span><span class="t-sm mu">Independent and non-commercial. No ads, no paid placement. Every price shows its source and when we last checked it.</span></div><div class="row g32 as" style="gap:48px">{c}</div></div></footer>'''

def next_step(kicker, title, sub, cta='Continue'):
    return f'''<section class="next" data-da="next-step" aria-label="Your next step"><div class="fl1"><div class="k">Your next step · {kicker}</div><div class="ttl">{title}</div><div class="t-sm" style="opacity:.75;margin-top:2px">{sub}</div></div><a class="btn" href="#">{cta} {svg("arrow-right")}</a></section>'''

def page(sid, title, body, active='', tab='home', signed=False, helper='', overlay='', theme_note=''):
    hb = ' class="has-helper"' if helper else ''
    return f'''<!doctype html>
<html lang="en-NG"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="da-screen" content="{sid}"><title>{title} · Digital Advantage (reference)</title>
<link rel="icon" href="{R}/assets/brand/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="../../fonts/fonts.css"><link rel="stylesheet" href="../../tokens/tokens.css"><link rel="stylesheet" href="../../components/da.css">
<script>/* reference only: ?theme=dark|light */(function(){{var t=new URLSearchParams(location.search).get('theme');if(t)document.documentElement.setAttribute('data-theme',t)}})()</script>
</head><body data-da-screen="{sid}">
{header(active, signed)}
<main id="main"{hb}>
{body}
</main>
{footer()}{helper}{tabbar(tab)}{overlay}
</body></html>'''

S = {}
def add(fid, sid, title, body, **kw):
    S[fid] = (sid, title, page(sid, title, body, **kw))

# ================================================================== SCREENS
KITS = [(k, VIS['kits'][k]) for k in ['get-a-remote-job', 'teach-kids-programming', 'become-a-freelancer', 'edit-a-short-video', 'sell-on-whatsapp', 'learn-ai-skills']]
def kit_card(slug, v, compact=False):
    return (f'<a class="card pad col g12" href="#" data-da="kit-card" style="min-width:{"150px" if compact else "0"}">{tile(v["icon"], v["hue"])}'
            f'<span class="b7" style="line-height:1.3">{v["title"]}</span></a>')

# 01 HOME (pilot: one promise, calmer, fewer chips, trust strip, 3-step how it works)
def home(picked=False):
    chips = ''.join(f'<button class="chip" data-da="identity-example">{x}</button>' for x in ["I'm a student", "Nurse", "Accountant", "Small business owner", "Teacher", "Farmer"])
    if picked:
        picker = f'''<div class="input wrapchips focus" data-da="identity-picker" role="combobox" aria-expanded="false"><span class="chip sel" data-da="identity-chip">{svg("stethoscope")} Nurse <span aria-label="Remove">{svg("x")}</span></span><span class="chip sel" data-da="identity-chip">{svg("video")} Content creator <span aria-label="Remove">{svg("x")}</span></span><span class="fl1"></span><span class="t-xs su">2 of 3</span></div>
<div class="t-label" style="margin-top:22px">Step 2 · What do you want to get better at?</div>
<div class="row g8 wrapf" style="margin-top:10px"><button class="chip" aria-pressed="true">{svg("check")} Keep patient notes</button><button class="chip">Explain conditions with pictures</button><button class="chip" aria-pressed="true">{svg("check")} Make short health videos</button><button class="chip">Revise for exams</button></div>'''
    else:
        picker = f'''<label class="input" data-da="identity-picker">{svg("search")}<input placeholder="Your job or role, e.g. nurse, accountant, farmer" aria-label="Your job or role"><span class="kbd desk">/</span></label>
<div class="row g8 wrapf" style="margin-top:12px">{chips}</div>'''
    return f'''<section class="wrap" style="padding-top:clamp(28px,5vw,64px)"><div class="row g32 as" style="justify-content:space-between">
 <div class="fl1" style="max-width:620px">
  <span class="chip soft sm">{svg("sparkles")} Free · Independent · 2,603 jobs and roles</span>
  <h1 class="t-display" style="margin-top:18px" data-da="promise">Find the tools people in your job use. <span class="hl">Learn them step by step.</span></h1>
  <p class="t-lg mu" style="margin-top:14px">Tell us what you do. We show the tools that matter for your work, how to learn each one, and your next step.</p>
  <div class="row sb" style="margin-top:30px"><span class="t-label">Step 1 · Who are you?</span><span class="row g8 t-sm mu"><span class="sw" role="switch" aria-checked="false" aria-label="I'm helping someone else"></span><span class="desk">I'm helping someone else</span><span class="mob">Helping someone</span></span></div>
  <div style="margin-top:10px">{picker}</div>
  <div class="row g16 wrapf" style="margin-top:22px"><a class="btn p lg" href="#" data-da="primary-cta">Show my tools {svg("arrow-right")}</a><a class="t-sm pr b6" href="#">Browse all jobs →</a></div>
 </div>
 <div class="desk" style="flex:none;width:min(520px,42vw)"><div class="mosaic" data-da="hero-mosaic">
  <div class="m" style="left:0;top:6%;width:47%;height:54%">{pic("nurse-tablet","portrait",eager=True)}</div>
  <div class="m" style="left:51%;top:0;width:49%;height:42%">{pic("remote-worker","card",eager=True)}</div>
  <div class="m" style="left:51%;top:46%;width:49%;height:54%">{pic("farmer-field","portrait")}</div>
  <div class="m" style="left:0;top:64%;width:47%;height:36%">{pic("shop-owner","card")}</div>
  <div class="float" style="left:26%;top:44%;width:240px"><div class="row g8"><span class="tag h-coral">{svg("stethoscope")} Nurse</span></div><div class="b7" style="margin-top:8px">Your tools are ready</div><div class="t-xs mu">6 needs · 18 tools · 3 learning paths</div><div class="row g6" style="margin-top:10px">{tl("Canva","sm")}{tl("Microsoft Excel","sm")}{tl("ChatGPT","sm")}<span class="t-xs su">+15</span></div></div>
 </div></div>
</div></section>
<section class="wrap sec"><div class="row sb ae"><div><span class="t-label">Common situations</span><h2 class="t-h2" style="margin-top:6px">Or start from what you want to do</h2></div><a class="t-sm pr b6 desk" href="#">All 29 kits →</a></div>
<div class="grid c3 m2" style="margin-top:18px">{"".join(kit_card(k, v) for k, v in KITS)}</div></section>
<section class="wrap sec"><div class="card pad" style="background:var(--da-color-surface-sunken);border:0"><div class="grid c3" style="gap:24px">
{"".join(f'<div><div class="t-h1 hl" style="font-size:2.25rem">{n}</div><div class="b7" style="margin-top:6px">{t}</div><div class="t-sm mu">{d}</div></div>' for n,t,d in [("1","Tell us what you do","Up to three roles. Nurse and content creator? Both count."),("2","See the tools that matter","Ranked for people in your job, with honest prices."),("3","Learn, then take the next step","Short paths with practice tasks, and one clear next step.")])}
</div></div></section>
<section class="wrap" style="padding-top:24px"><div class="banner info" data-da="trust-strip">{svg("shield-check")}<div class="fl1"><b>Independent and non-commercial.</b> <span class="mu">No ads, no affiliate links. Every tool shows its price, when we last checked it, or a clear Preview label.</span></div><a class="t-sm pr b6" href="#">How we review →</a></div></section>'''
add('01-home', 'S01-R', 'Home', home(), tab='home')
add('02-home-picked', 'S01-R', 'Home · roles picked', home(True), tab='home')

# 03 SEARCH
def search():
    goals = [('Get a remote job that pays in dollars', 'Find work', True, ['Remote4Africa', 'LinkedIn', 'Wise']), ('Find remote jobs open to people in Africa', 'Find work', False, ['Remote4Africa', 'Upwork', 'LinkedIn']), ('Check that a remote job offer is genuine', 'Stay safe', True, ['LinkedIn', 'Jobscan']), ('Prepare for a remote video interview', 'Get hired', False, ['Zoom', 'ChatGPT', 'Teal'])]
    g = ''.join(f'<a class="card pad row g16" href="#" data-da="goal-row">{tile("target","violet")}<div class="fl1"><div class="b7">{t}</div><div class="row g6 wrapf" style="margin-top:6px"><span class="tag h-teal">{c}</span>{"<span class=\'tag h-amber\'>"+svg("shield")+" Safety tips</span>" if s else ""}</div></div><span class="row g4 desk">{"".join(tl(x,"sm") for x in ts)}</span>{svg("chevron-right","cr")}</a>' for t, c, s, ts in goals)
    return f'''<section class="wrap" style="padding-top:24px">
<label class="input focus" style="min-height:64px;border-radius:20px;font-size:1.125rem" data-da="nl-search">{svg("search")}<span class="v fl1"><span class="su">I want to</span> get a remote job that pays in dollars</span>{svg("x")}</label>
<div class="row g8 wrapf" style="margin-top:12px"><button class="chip on">All 24</button><button class="chip">Kits 2</button><button class="chip">Goals 14</button><button class="chip">Tools 8</button><span class="fl1"></span><span class="t-sm mu">For <b class="pr">Nigeria</b> · <a class="pr b6" href="#">Change</a></span></div>
<div class="rail" style="margin-top:22px"><div class="col g12">
<a class="card el feat row g16" href="#" style="padding:16px" data-da="best-match"><div class="photo desk" style="width:160px;height:110px;flex:none;border-radius:14px">{pic("remote-worker","card",sizes="160px")}</div><div class="fl1"><div class="row g8"><span class="tag h-violet">{svg("layers")} Kit</span><span class="t-xs su">Best match</span></div><div class="t-h3" style="margin-top:8px">Get a remote job</div><div class="t-sm mu">CV, the right job boards, spotting fake offers and getting paid. 9 steps.</div></div><span class="btn p sm desk">Open kit {svg("arrow-right")}</span></a>
<div class="t-label" style="margin-top:12px">Goals</div>{g}</div>
<aside class="col g16"><div class="card pad"><div class="t-label">We understood</div><div class="col g8 t-sm" style="margin-top:10px"><div class="row sb"><span class="mu">Outcome</span><b>get a remote job</b></div><div class="row sb"><span class="mu">Detail</span><b>paid in dollars</b></div><div class="row sb"><span class="mu">Market</span><b>Nigeria</b></div></div></div>
<div class="safe" data-da="safety-note"><div class="hd">{svg("shield")} Before you apply</div><div class="bd">Real employers don't charge you to apply or to be hired. Check the company before you share documents or bank details.</div></div></aside></div></section>'''
add('03-search', 'S51', 'Search results', search(), tab='goals')

# 04 IDENTITY (pilot: needs feedback, role-specific paths first, next step)
def identity():
    needs = [('Keep patient notes and records', 'coral', 'pulse', ['Microsoft Excel', 'Notion', 'Google Docs'], 'For nurses'), ('Explain a condition with pictures', 'pink', 'palette', ['Canva', 'Figma', 'ChatGPT'], 'For nurses'), ('Revise for exams and CPD', 'violet', 'graduation', ['Coursera', 'Notion'], None), ('Plan shifts and rotas', 'teal', 'clock', ['Google Sheets', 'Microsoft Excel', 'Trello'], None), ('Make short health videos', 'pink', 'video', ['CapCut', 'Canva'], None), ('Check health advice found online', 'amber', 'shield-check', ['ChatGPT', 'Claude'], None)]
    cards = ''.join(f'''<article class="card pad el col" data-da="need-card"><div class="row sb">{tile(ic, h)}{f'<span class="tag depth-role" data-da="depth-label">{svg("check")} {lens}</span>' if lens else '<span class="tag depth-general" data-da="depth-label">General guide</span>'}</div>
<div class="b7" style="margin-top:14px;font-size:1.0625rem">{t}</div><div class="row g6" style="margin-top:12px">{"".join(tl(x,"sm") for x in ts)}<span class="t-xs su" style="margin-left:4px">+{4+len(t)%4} tools</span></div>
<div class="hr" style="margin:14px 0 10px"></div><div class="row sb t-sm"><a class="pr b6" href="#">See tools →</a><span class="row g6 su t-xs" data-da="need-feedback">Right for your work? <button class="chip sm" aria-label="Yes, this fits">{svg("thumbs-up")}</button><button class="chip sm" aria-label="Not my work">{svg("thumbs-down")}</button></span></div></article>''' for t, h, ic, ts, lens in needs)
    return f'''<section style="background:linear-gradient(180deg,var(--da-hue-coral-bg),var(--da-color-canvas))"><div class="wrap" style="padding-top:24px;padding-bottom:26px">
<nav class="crumbs" aria-label="Breadcrumb">Explore {svg("chevron-right")} Health &amp; Medicine {svg("chevron-right")} Nursing</nav>
<div class="row sb ae wrapf g16" style="margin-top:14px"><div class="row g16"><div class="photo" style="width:84px;height:84px;border-radius:24px;flex:none">{pic("nurse-tablet","square",sizes="84px",eager=True)}</div><div><div class="row g6 wrapf"><span class="tag h-coral">Profession</span><span class="tag h-slate">ISCO-08 2221</span><span class="tag h-amber">{svg("clock")} Expert review pending</span></div><h1 class="t-h1" style="margin-top:8px">Tools for nurses</h1><div class="t-sm mu">Also: registered nurse · staff nurse · nursing officer</div></div></div>
<div class="row g10"><button class="btn s">{star()} Star</button><a class="btn p desk" href="#">{svg("route")} Start my path</a></div></div></div></section>
<section class="wrap"><div class="row g8 wrapf" style="margin:4px 0 20px"><div class="seg" role="tablist"><button role="tab" aria-selected="true">Needs</button><button role="tab">Goals</button><button role="tab">Tools</button><button role="tab">Learning paths</button></div></div>
<div class="banner info" style="margin-bottom:16px" data-da="feedback-explainer">{svg("info")}<div class="fl1 t-sm">Tell us if a need isn't part of your work. We use your answers to make this list fit nurses better.</div></div>
<div class="grid c3">{cards}</div>
<div style="margin-top:24px">{next_step("2 minutes", "Open the Excel path for nurses", "Start with “Track patient observations in a table”. Written for clinical work.", "Start")}</div></section>'''
add('04-identity', 'S27', 'Identity · Nurse', identity(), active='explore', tab='explore')

# 05 BROWSE
def browse():
    secs = list(VIS['sectors'].items())[:16]
    cards = ''.join(f'<a class="card pad row g12" href="#" data-da="sector-card" style="padding:16px">{tile(v["icon"], v["hue"])}<div class="fl1"><div class="b7 t-sm">{v["label"]}</div><div class="t-xs su">{60 + (len(v["label"])*7)%160} roles</div></div>{svg("chevron-right","cr")}</a>' for k, v in secs)
    return f'''<section class="wrap" style="padding-top:28px"><span class="t-label">Browse all jobs</span><h1 class="t-h1" style="margin-top:6px">2,603 jobs and roles</h1><p class="mu" style="margin-top:6px">Every occupation in the ISCO-08 standard, plus specialisms and life roles like parent or retiree.</p>
<label class="input" style="margin-top:20px">{svg("search")}<input placeholder="Filter jobs, e.g. midwife" aria-label="Filter jobs"></label>
<div class="row g8 wrapf" style="margin-top:12px"><div class="seg"><button aria-selected="true">By sector</button><button>A–Z</button><button>Life roles</button></div></div>
<div class="grid c4" style="margin-top:18px">{cards}</div>
<div class="card pad row g16 wrapf" style="margin-top:20px">{tile("plus","violet")}<div class="fl1"><div class="b7">Can't find your job?</div><div class="t-sm mu">Tell us. We add new roles every week.</div></div><a class="btn s" href="#">Suggest my role</a></div></section>'''
add('05-browse', 'S33', 'Browse all jobs', browse(), active='explore', tab='explore')

# 06 GOALS INDEX
def goals():
    it = ''.join(f'<button class="card pad col g10" style="text-align:left;{"border:2px solid var(--da-color-ink)" if k=="grow" else ""}" aria-pressed="{str(k=="grow").lower()}">{tile(VIS["intents"][k]["icon"], VIS["intents"][k]["hue"])}<div class="row sb ae"><span class="t-h3">{k.title()}</span><span class="t-mono t-xs su">{n} goals</span></div><span class="t-sm mu">{d}</span></button>' for k, n, d in [('compete', 432, 'Match what others in your field already do.'), ('grow', 450, 'Win more customers, income or skill.'), ('scale', 282, 'Do more with less time.')])
    groups = [('Find work and get paid', ['Get a remote job that pays in dollars', 'Start freelancing', 'Get paid by international clients']), ('Sell and market', ['Sell on WhatsApp', 'Open an online shop', 'Run ads on a small budget']), ('Learn and teach', ['Learn to code for free', 'Teach online', 'Pass JAMB, WAEC or NECO'])]
    gg = ''.join(f'<div class="card pad"><div class="b7">{h}</div><div class="list" style="margin-top:6px">' + ''.join(f'<a class="li t-sm" href="#">{svg("target")}<span class="fl1">{x}</span>{svg("chevron-right","cr")}</a>' for x in xs) + '</div></div>' for h, xs in groups)
    return f'''<section class="wrap" style="padding-top:28px"><span class="t-label">Goals</span><h1 class="t-h1" style="margin-top:6px">1,050 things you can get done</h1>
<label class="input" style="margin-top:18px">{svg("search")}<input placeholder="I want to… e.g. send an invoice" aria-label="Search goals"><span class="kbd desk">⌘K</span></label>
<div class="grid c3" style="margin-top:18px">{it}</div><div class="grid c3" style="margin-top:16px">{gg}</div></section>'''
add('06-goals', 'S42', 'Goals', goals(), active='goals', tab='goals')

# 07 GOAL (pilot: Learn this tool on every row, trust line, next step)
GT = [('Remote4Africa', 'Job board for remote roles open to people in Africa. Listings are checked for African eligibility.', 'free', '22 Oct 2026', True, 'In depth'),
      ('LinkedIn', 'Professional network. Recruiters search profiles, so a complete one gets found.', 'freemium', None, False, 'For job seekers'),
      ('Upwork', 'Freelance marketplace for project work paid in dollars, with escrow on contracts.', 'usage', None, False, 'General guide')]
def tool_row(n, name, desc, price, chk, top, depth):
    dcls = {'In depth': 'depth-deep', 'General guide': 'depth-general'}.get(depth, 'depth-role')
    return f'''<article class="card pad {"el feat" if top else ""}" data-da="tool-row"><div class="row g16 as"><span class="t-mono su t-sm desk" style="margin-top:12px">{n:02d}</span>{tl(name)}
<div class="fl1"><div class="row g8 wrapf"><span class="b7" style="font-size:1.0625rem">{name}</span>{"<span class='tag h-violet'>"+svg("star")+" Top pick</span>" if top else ""}</div><div style="margin-top:6px">{trust(price, chk)}</div>
<p class="t-sm mu" style="margin-top:8px">{desc}</p>
<div class="row g8 wrapf" style="margin-top:12px"><a class="btn {"p" if top else "s"} sm" href="#" data-da="learn-tool">{svg("route")} Learn {name}</a><span class="tag {dcls}" data-da="depth-label">{depth}</span><a class="t-sm pr b6" href="#" style="margin-left:4px">Official site {svg("external")}</a></div></div>
<button class="ib" aria-label="Star {name}">{star()}</button></div></article>'''
def goal():
    rows = ''.join(tool_row(k + 1, *t) for k, t in enumerate(GT))
    alts = ''.join(f'<a class="card row g10" href="#" style="padding:12px 14px;width:200px">{tl(x,"sm")}<div><div class="b6 t-sm">{x}</div><div class="t-xs su">{p}</div></div></a>' for x, p in [('Fiverr', 'Pay per use'), ('Wise', 'Pay per use'), ('Payoneer', 'Pay per use'), ('Grey', 'Free plan + paid'), ('Raenest', 'Free account')])
    return f'''<section class="wrap" style="padding-top:22px"><nav class="crumbs">Goals {svg("chevron-right")} Find work</nav>
<div class="row sb ae wrapf g16" style="margin-top:12px"><div style="max-width:760px"><div class="row g6 wrapf"><span class="tag h-green">{svg("trending-up")} Grow</span><span class="tag h-slate">{svg("globe")} Nigeria · Africa</span></div><h1 class="t-h1" style="margin-top:10px">Get a remote job that pays in dollars</h1><p class="t-lg mu" style="margin-top:6px">The tools people use to find genuine remote roles, get hired and get paid safely.</p></div><div class="row g10"><button class="btn s">{star()} Star</button><button class="btn s">{svg("share")} Share</button></div></div>
<div class="card soft row g12 wrapf" style="margin-top:18px;padding:12px 16px" data-da="kit-ribbon"><span class="tag h-violet">{svg("layers")} Kit</span><span class="b7">Get a remote job</span><span class="t-sm mu">Step 6 of 9</span><div class="prog pr fl1" style="min-width:120px;max-width:300px"><i style="width:62%"></i></div><span class="fl1 desk"></span><a class="btn g sm desk" href="#">{svg("chevron-left")} Back</a><a class="btn p sm" href="#">Next step {svg("arrow-right")}</a></div>
<div class="rail" style="margin-top:22px"><div class="col g12"><div class="row sb"><h2 class="t-h3">Tools for this goal</h2><span class="row g8"><button class="chip sm">{svg("filter")} Free only</button></span></div>{rows}
<div class="row sb" style="margin-top:10px"><h2 class="t-h3">7 alternatives</h2><span class="t-xs su">Same kind of tool</span></div><div class="hscroll">{alts}</div>
<div style="margin-top:12px">{next_step("Kit step 7 of 9", "Prepare for a remote video interview", "15 minutes · uses Zoom and Teal")}</div></div>
<aside class="col g16"><div class="safe" data-da="safety-note"><div class="hd">{svg("shield")} Job and income offers<span class="fl1"></span><span class="t-xs su" style="font-weight:500">Safety note</span></div><div class="bd">Real employers don't charge you to apply or to be hired. Check the company before you share documents or bank details.
<div class="t-label" style="margin-top:14px">Red flags</div>{"".join(f'<div class="flag">{svg("flag")}<span>{f}</span></div>' for f in ["Asks you to pay for a form, training or equipment first","Interview only on WhatsApp or Telegram","Salary far above the usual"])}
<div class="t-label" style="margin-top:14px">Where to get help</div><div class="mu" style="margin-top:6px">Check the company on its official site and CAC records. Report scams to EFCC.</div></div></div>
<div class="card pad"><div class="t-label">Related goals</div><div class="list" style="margin-top:4px">{"".join(f'<a class="li t-sm" href="#">{svg("target")}<span class="fl1 b6">{x}</span>{svg("chevron-right","cr")}</a>' for x in ["Get paid by international clients","Write a CV that passes screening","Open a dollar account"])}</div></div></aside></div></section>'''
add('07-goal', 'S43', 'Goal', goal(), active='goals', tab='goals')
SHEET = f'''<div class="scrim"></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh1" data-da="safety-sheet"><div class="grab"></div><div class="row sb" style="margin-top:14px"><h2 id="sh1" class="t-h3 row g8"><span style="color:var(--da-color-info)">{svg("shield")}</span> Before you apply</h2><button class="ib" aria-label="Close">{svg("x")}</button></div>
<p class="t-sm" style="margin-top:12px">Real employers don't charge you to apply or to be hired. Check the company before you share documents or bank details.</p><div class="t-label" style="margin-top:16px">Red flags</div>
{"".join(f'<div class="banner err" style="margin-top:8px;border:0;padding:12px">{svg("flag")}<span>{f}</span></div>' for f in ["Asks you to pay for a form or training first","Interview only on WhatsApp or Telegram","Salary far above the usual"])}
<button class="btn p blk" style="margin-top:18px">Got it</button></div>'''
add('08-goal-safety-sheet', 'S43', 'Goal · safety sheet', goal(), active='goals', tab='goals', overlay=SHEET)

# 09 KITS
def kits():
    allk = list(VIS['kits'].items())
    cards = ''.join(f'<a class="card pad col g12" href="#" data-da="kit-card">{tile(v["icon"], v["hue"])}<span class="b7 t-sm" style="line-height:1.3">{v["title"]}</span></a>' for k, v in allk[4:16])
    return f'''<section class="wrap" style="padding-top:28px"><span class="t-label">Kits · Common situations</span><h1 class="t-h1" style="margin-top:6px">Start from your situation</h1><p class="t-lg mu" style="margin-top:6px">29 ready-made paths. Each kit puts the goals, tools and safety checks you need in order.</p>
<div class="grid c2" style="margin-top:20px"><a class="card el" href="#" style="overflow:hidden;display:grid;grid-template-columns:1fr" data-da="kit-feature"><div style="aspect-ratio:16/9">{pic("kids-coding","wide",style="height:100%;border-radius:0",eager=True)}</div><div class="pad" style="padding:22px"><span class="tag h-coral">{svg("sparkles")} Technology education</span><h2 class="t-h2" style="margin-top:10px">Teach kids programming</h2><p class="t-sm mu" style="margin-top:6px">Age-right tools, lesson plans, a club, and keeping children's data safe.</p><div class="row g6" style="margin-top:12px">{tl("Scratch","sm")}{tl("Code.org","sm")}{tl("micro:bit","sm")}{tl("Python","sm")}</div></div></a>
<a class="card el" href="#" style="overflow:hidden;display:grid;grid-template-columns:1fr" data-da="kit-feature"><div style="aspect-ratio:16/9">{pic("remote-worker","wide",style="height:100%;border-radius:0")}</div><div class="pad" style="padding:22px"><span class="tag h-violet">{svg("briefcase")} Most started</span><h2 class="t-h2" style="margin-top:10px">Get a remote job</h2><p class="t-sm mu" style="margin-top:6px">CV that passes screening, real job boards, safe payments.</p><div class="row g6" style="margin-top:12px">{tl("Remote4Africa","sm")}{tl("LinkedIn","sm")}{tl("Jobscan","sm")}{tl("Wise","sm")}</div></div></a></div>
<div class="grid c6" style="margin-top:16px">{cards}</div></section>'''
add('09-kits', 'S49', 'Kits', kits(), active='kits', tab='kits')

# 10 KIT
STEPS = [('Pick a coding app for children', 'ScratchJr · Kodable · Lightbot', 'done'), ('Teach 5 to 8 year olds their first coding', 'ScratchJr · Kodable', 'done'), ('Teach kids to code with drag-and-drop blocks', 'Scratch · Code.org · Tynker', 'now'), ('Teach programming without a computer', 'CS Unplugged · Code.org', ''), ('Teach kids to make their own games', 'Scratch · Tynker', ''), ('Teach kids robotics and electronics', 'micro:bit · Arduino', ''), ('Move kids from blocks to Python', 'Python · Replit', '')]
def kit():
    st = ''
    for k, (t, ts, s) in enumerate(STEPS):
        n = svg('check') if s == 'done' else str(k + 1)
        body = (f'<div class="card el feat pad" style="padding:16px 18px"><div class="b7 ttl">{t}</div><div class="row g8 wrapf" style="margin-top:10px">{tl("Scratch","sm")}{tl("Code.org","sm")}{tl("Tynker","sm")}<span class="tag h-coral">{svg("shield")} Kids</span><span class="fl1"></span><a class="btn p sm" href="#" data-da="learn-tool">Continue {svg("arrow-right")}</a></div></div>' if s == 'now'
                else f'<div style="padding-top:5px"><div class="b6 ttl">{t}</div><div class="t-xs su">{ts}</div></div>')
        st += f'<li class="step {s}" data-da="kit-step"><span class="n">{n}</span><div class="fl1">{body}</div></li>'
    return f'''<section class="hero-media" style="min-height:clamp(240px,32vw,320px)" data-da="kit-hero">{pic("kids-coding","wide",cls="",style="position:absolute;inset:0",sizes="100vw",eager=True)}<div class="scrimg"></div>
<div class="wrap on-media" style="position:relative;padding-top:clamp(90px,10vw,48px);padding-bottom:24px"><nav class="crumbs">Kits {svg("chevron-right")} Technology education</nav><h1 class="t-display" style="margin-top:10px;max-width:640px">Teach kids programming</h1><p class="t-lg desk" style="opacity:.85;max-width:540px;margin-top:8px">Age-right tools, lesson plans, a club, and keeping children's data safe.</p>
<div class="row g10" style="margin-top:16px"><a class="btn p" href="#">Continue at step 3 {svg("arrow-right")}</a><button class="btn glass">{star()} Star</button></div></div></section>
<section class="wrap rail" style="padding-top:24px"><div><div class="row sb"><h2 class="t-h3">9 steps</h2><span class="row g10 t-sm mu"><span class="prog" style="width:120px"><i style="width:22%"></i></span>2 of 9 · saved on this device</span></div><ol style="list-style:none;padding:0;margin:18px 0 0">{st}</ol>
{next_step("Kit step 3 of 9", "Teach kids to code with blocks", "Use Scratch. Lesson plan included. About 45 minutes.", "Continue")}</div>
<aside class="col g16"><div class="safe" data-da="safety-note"><div class="hd">{svg("baby")} Children and teaching</div><div class="bd">Children's data and images are sensitive. Use child-safe platforms and follow your school's rules.{"".join(f'<div class="flag">{svg("flag")}<span>{f}</span></div>' for f in ["An app asks for a child's full name, photo or location","Open chat with strangers","Ads aimed at children"])}</div></div>
<div class="card pad"><div class="t-label">Good for</div><div class="row g6 wrapf" style="margin-top:10px">{"".join(f"<span class='chip sm'>{x}</span>" for x in ["Teacher","Parent","Youth leader","STEM club lead"])}</div></div></aside></section>'''
add('10-kit', 'S50', 'Kit · Teach kids programming', kit(), active='kits', tab='kits')

# 11 TOOL (pilot: trust box, role path first, learn CTA)
def tool(unavail=False):
    name = 'Uber' if unavail else 'Canva'
    if unavail:
        head = ('Uber (driver)', 'Uber Technologies', 'Ride-hailing app operating in many countries. Check it runs in your city before you sign up to drive.', 'usage')
        banner = f'<div class="banner err" style="margin-top:16px" data-da="availability-banner">{svg("alert")}<div class="fl1"><b>Not available in Nigeria</b><div class="mu t-sm">Uber ended its operations in Nigeria on 2 September 2026. It still works in other countries. We don\'t recommend it to visitors in Nigeria.</div><div class="row g8 wrapf" style="margin-top:10px"><span class="t-xs su">Use instead:</span>{tl("Bolt (driver)","sm")}{tl("inDrive","sm")}</div></div></div>'
    else:
        head = ('Canva', 'Canva Pty Ltd', 'Easy online design tool for social posts, presentations, logos and documents. The free plan covers most basic needs.', 'freemium')
        banner = ''
    paths = [('Canva for nurses: patient leaflets', 'For your job', 'depth-role', '5 modules · ≈ 4 h'), ('Canva: beginner to advanced', 'In depth', 'depth-deep', '8 modules · ≈ 13 h'), ('Canva for church media', 'For pastors', 'depth-role', '6 modules')]
    if unavail: paths = [('Uber for drivers: get started safely', 'General guide', 'depth-general', '10 modules')]
    price_t, price_s, unchecked, prev_txt, start_txt, nxt = (('Fares vary; service fee for drivers', 'Check the current fee in your city.', 'Fees · cities covered · licence rules', 'canva.com', 'Start: Canva for nurses', ("After this tool", "Make your first patient leaflet", "Goal · 20 minutes · uses Canva")) if not unavail else
        ('Fares vary; service fee for drivers', 'Check the current fee in your city.', 'Fees · cities covered · licence rules', 'uber.com', 'Open the general guide', ("Instead, in Nigeria", "Compare Bolt and inDrive for drivers", "Goal · 10 minutes")))
    if not unavail: price_t, price_s, unchecked = 'Free plan with many templates', 'Pro adds brand kit and background remover.', 'Plan limits · price in naira · supported devices'
    pp = ''.join(f'<a class="card pad row g12" href="#" data-da="path-card" style="padding:14px 16px">{tile("route","violet","sm")}<div class="fl1"><div class="b7 t-sm">{t}</div><div class="t-xs su">{m}</div></div><span class="tag {c}" data-da="depth-label">{d}</span></a>' for t, d, c, m in paths)
    return f'''<section class="wrap" style="padding-top:22px"><nav class="crumbs">Tools {svg("chevron-right")} {"Design &amp; media" if not unavail else "Transport"}</nav>
<div class="row g16 as wrapf" style="margin-top:14px">{tl(head[0],"lg")}<div class="fl1" style="min-width:260px"><h1 class="t-h1">{name}</h1><div class="t-sm su">by {head[1]} · Web, iOS, Android</div><div style="margin-top:8px">{trust(head[3])}</div><p class="t-lg mu" style="margin-top:10px;max-width:680px">{head[2]}</p></div>
<div class="row g10"><button class="btn s">{star()} Star</button><a class="btn s" href="#">Official site {svg("external")}</a></div></div>{banner}
<div class="rail" style="margin-top:22px"><div class="col g16">
<div class="card pad" data-da="trust-box"><div class="row sb wrapf g8"><h2 class="t-h3">Price and checks</h2><a class="t-sm pr b6" href="#">How we review →</a></div>
<div class="grid c2" style="margin-top:12px"><div><div class="t-label">Price</div><div class="b7" style="margin-top:6px">{price_t}</div><div class="t-sm mu">{price_s}</div></div><div><div class="t-label">Not checked yet</div><div class="t-sm mu" style="margin-top:6px">{unchecked}</div></div></div>
<div class="pv" style="margin-top:14px" data-da="preview-explainer">{svg("eye")}<span><b>Preview:</b> written from general knowledge and not yet checked against {prev_txt}. Confirm before you pay.</span></div></div>
<div class="row sb"><h2 class="t-h3">Learn {name}</h2><span class="t-xs su">Paths for your job come first</span></div><div class="col g10">{pp}</div>
<a class="btn p lg" href="#" data-da="learn-tool" style="align-self:flex-start">{svg("route")} {start_txt}</a>
{next_step(*nxt)}</div>
<aside class="col g16"><div class="card pad"><div class="t-label">Who uses {name}</div><div class="t-stat" style="margin-top:8px">{"1,776 roles" if not unavail else "114 roles"}</div><div class="t-xs su">{"in 22 sectors" if not unavail else "in 5 sectors"}</div><div class="row g6 wrapf" style="margin-top:12px">{"".join(f"<span class='chip sm'>{x}</span>" for x in (["Content creator","Teacher","Nurse","Pastor","+1,772"] if not unavail else ["Transport · 79","Hospitality · 20","Agriculture · 13","+2 sectors"]))}</div></div>
<div class="card pad"><div class="t-label">Similar tools</div><div class="list" style="margin-top:4px">{"".join(f'<a class="li" href="#">{tl(a,"sm")}<span class="t-sm b6 fl1">{a.replace(" (driver)","")}</span><span class="t-xs su">{p}</span></a>' for a,p in ([("Adobe Express","Free plan + paid"),("Figma","Free plan + paid")] if not unavail else [("Bolt (driver)","Pay per use"),("inDrive","Pay per use")]))}</div></div>
<a class="row g8 t-sm mu" href="#" data-da="suggest-edit">{svg("edit")} Something wrong? <span class="pr b6">Suggest an edit</span></a></aside></div></section>'''
add('11-tool', 'S09', 'Tool · Canva', tool(), active='explore', tab='explore')
add('12-tool-unavailable', 'S09', 'Tool · availability banner', tool(True), active='explore', tab='explore')

# 13/14 ROADMAP (depth honesty, D-094)
def roadmap(general=False):
    lv = [('Beginner', 'green', [('Track patient observations in a table', 'Set up columns, units and dates that match a ward chart', 'Enter one shift of observations for 5 patients', 1, 'done'), ('Spot problems with conditional formatting', 'Flag out-of-range vitals automatically', 'Highlight any temperature above 38 °C', 1, 'now'), ('Charts for handover', 'Turn a week of readings into one clear chart', 'Make a trend chart for one patient', 1.5, '')]),
          ('Intermediate', 'blue', [('Audit a ward with pivot tables', 'Summarise falls or infections by month', 'Count incidents by type for one quarter', 2, ''), ('Protect patient data', 'Passwords, sharing and what never to store', 'Remove names from a sheet you share', 1, '')])]
    if general:
        lv = [('Beginner', 'green', [('Get started with Microsoft Excel', 'Set up, find your way around, finish a first task', 'Complete the official getting-started guide', 1, 'done'), ('Core use', 'Formulas, formatting and saving', 'Build a simple budget', 1, 'now'), ('Get more value', 'Shortcuts and templates', 'Reuse a template for a real task', 1.5, '')]), ('Intermediate', 'blue', [('Advanced Microsoft Excel', 'Pivot tables and lookups', 'Summarise a dataset', 2, '')])]
    cols = ''
    for name, hue, ms in lv:
        cards = ''.join(f'''<article class="card pad {"el feat" if s=="now" else ""}" data-da="module-card"><div class="row sb"><span class="chk" role="checkbox" aria-checked="{str(s=="done").lower()}" aria-label="Mark done">{svg("check") if s=="done" else ""}</span><span class="t-xs su row g4">{svg("clock")} ≈ {h} h</span></div>
<div class="b7" style="margin-top:12px">{t}</div><div class="t-sm mu" style="margin-top:4px">You can: {o[0].lower()+o[1:]}</div><div class="row g8 t-xs as" style="margin-top:12px;padding:10px;border-radius:10px;background:var(--da-color-surface-sunken)"><span class="pr">{svg("hand")}</span><span><b>Practice:</b> {p}</span></div></article>''' for t, o, p, h, s in ms)
        cols += f'<div class="col g12"><div class="row sb"><span class="tag h-{hue}">{name}</span><span class="t-xs su">{len(ms)} modules</span></div>{cards}</div>'
    if general:
        lab = f'<span class="tag depth-general" data-da="depth-label">General guide</span>'
        note = f'<div class="banner info" style="margin-top:16px" data-da="depth-explainer">{svg("info")}<div class="fl1"><b>This is a general guide, not written for your job yet.</b> <span class="mu">Pick a path for your work below, or vote for one so we write it next.</span><div class="row g8 wrapf" style="margin-top:10px"><a class="chip sel" href="#">Excel for nurses</a><a class="chip" href="#">Excel for accountants</a><a class="chip" href="#">{svg("plus")} Ask for my job</a></div></div></div>'
        title = 'Microsoft Excel: general guide'
    else:
        lab = f'<span class="tag depth-role" data-da="depth-label">{svg("check")} Written for nurses</span>'
        note = ''
        title = 'Excel for nurses'
    return f'''<section class="wrap" style="padding-top:22px"><nav class="crumbs">Microsoft Excel {svg("chevron-right")} Learning path</nav>
<div class="row sb ae wrapf g16" style="margin-top:12px"><div class="row g16">{tl("Microsoft Excel","lg")}<div><h1 class="t-h1">{title}</h1><div class="row g8 wrapf" style="margin-top:6px">{lab}<span class="tag h-amber">{svg("clock")} Expert review pending</span><span class="t-sm mu">5 modules · ≈ 6.5 h</span></div></div></div>
<div class="card" style="padding:14px 18px;min-width:260px"><div class="row sb t-sm"><b>1 of 5 done</b><span class="mu">20%</span></div><div class="prog" style="margin-top:8px"><i style="width:20%"></i></div><div class="t-xs su" style="margin-top:6px">Saved on this device · sign in to keep it everywhere</div></div></div>{note}
<div class="grid c2" style="margin-top:22px;align-items:start">{cols}</div>
<div style="margin-top:22px">{next_step("Module 2 of 5", "Spot problems with conditional formatting", "About 1 hour · practice task included", "Start module")}</div></section>'''
add('13-roadmap', 'S30', 'Learning path · written for your job', roadmap(), active='explore', tab='explore')
add('14-roadmap-general', 'S30', 'Learning path · general guide', roadmap(True), active='explore', tab='explore')

# 15 HELPER with helper bar + first-run coach mark (pilot: 4/17 didn't get it)
def helper():
    stages = [('Record a song that sounds clean on phone speakers', 'done', ['BandLab', 'Audacity']), ('Mix and master without a studio', 'done', ['REAPER', 'BandLab']), ('Make cover art and a short teaser', 'now', ['Canva', 'CapCut']), ('Release on Spotify, Apple Music and Audiomack', '', ['DistroKid', 'Audiomack']), ('Find your first thousand listeners', '', ['Spotify for Artists']), ('Understand who listens', '', ['Spotify for Artists'])]
    st = ''.join(f'<article class="card pad {"el feat" if s=="now" else ""}" data-da="stage-card"><div class="row sb"><span class="t-mono t-xs su">STAGE {k+1}</span>{"<span class=\'chk\' aria-checked=\'true\'>"+svg("check")+"</span>" if s=="done" else "<span class=\'tag h-violet\'>Now</span>" if s=="now" else ""}</div><div class="b7" style="margin-top:8px">{t}</div><div class="row g6" style="margin-top:12px">{"".join(tl(x,"sm") for x in ts)}</div></article>' for k, (t, s, ts) in enumerate(stages))
    return f'''<section class="hero-media" style="min-height:clamp(220px,28vw,300px)">{pic("musician-studio","wide",cls="",style="position:absolute;inset:0",sizes="100vw",eager=True)}<div class="scrimg"></div>
<div class="wrap on-media" style="position:relative;padding-top:clamp(80px,9vw,56px);padding-bottom:22px"><span class="tag glass">{svg("music")} Helper · Musician</span><h1 class="t-h1" style="margin-top:10px;max-width:640px">From idea to released song, and your first thousand listeners</h1></div></section>
<section class="wrap" style="padding-top:22px"><div class="banner info" data-da="helper-explainer">{svg("route")}<div class="fl1 t-sm"><b>What is a helper?</b> A step-by-step guide for your kind of work. It stays at the bottom of the screen while you open tools, so you never lose your place.</div></div>
<div class="row sb" style="margin-top:18px"><h2 class="t-h3">6 stages · 16 tools</h2><span class="t-sm mu">2 of 6 done</span></div><div class="grid c3" style="margin-top:12px">{st}</div>
<div style="margin-top:22px">{next_step("Stage 3", "Make a 3000 × 3000 cover in Canva", "First win in 15 minutes")}</div></section>'''
HB = f'''<aside class="helperbar" data-da="helper-bar" aria-label="Helper: Musician, stage 3 of 6"><div class="coach" role="dialog" aria-label="Tip" data-da="helper-coachmark"><b>This is your helper.</b> It stays here while you browse. Tap it for your next step, or close it any time.<div class="row g8" style="margin-top:10px"><button class="btn p sm">Got it</button><button class="btn g sm">Hide helper</button></div></div>
<span class="tile sm glass">{svg("music")}</span><div class="fl1"><div class="t-xs" style="opacity:.7">Musician · Stage 3 of 6</div><div class="b7 t-sm">Make cover art and a teaser</div><div class="prog" style="margin-top:6px;height:5px"><i style="width:33%"></i></div></div><a class="btn inv sm" href="#">Next {svg("arrow-right")}</a><button class="ib glass-line" style="background:transparent;color:inherit" aria-label="Hide helper">{svg("x")}</button></aside>'''
add('15-helper', 'S40', 'Helper · Musician', helper(), active='helpers', tab='explore', helper=HB)

# 16 WORKBENCH
def workbench():
    recs = [('Next in your kit', 'Prepare for a remote video interview', 'Get a remote job · step 7 of 9', 'violet', 'layers'), ('Because you can do SQL', 'Build a KPI dashboard', 'Power BI · Looker Studio', 'blue', 'chart'), ('Check first', 'Check a remote offer is genuine', '5 minutes · safety', 'amber', 'shield')]
    r = ''.join(f'<article class="card pad el" data-da="suggestion-card"><div class="row sb"><span class="tag h-{c}">{svg(ic)} {h}</span><button class="ib" style="width:32px;height:32px;min-width:32px;min-height:32px;border:0" aria-label="Dismiss">{svg("x")}</button></div><div class="b7" style="margin-top:10px">{t}</div><div class="t-xs su">{s}</div><div class="row g8" style="margin-top:12px"><button class="chip sm">Not for me</button><button class="chip sm">Already know</button></div></article>' for h, t, s, c, ic in recs)
    sk = ''.join(f'<div class="row g12" style="padding:10px 0"><span class="t-sm b6" style="width:140px">{t}</span><div class="prog fl1"><i style="width:{p}%;background:{c}"></i></div><span class="tag {tg}" style="width:96px;justify-content:center">{s}</span></div>' for t, p, c, s, tg in [("SQL", 100, "var(--da-color-success)", "Can do", "h-green"), ("Dashboards", 55, "var(--da-color-primary)", "Learning", "h-violet"), ("Data cleaning", 40, "var(--da-color-primary)", "Learning", "h-violet"), ("Python", 0, "var(--da-color-border)", "Starred", "h-amber")])
    return f'''<section class="wrap" style="padding-top:26px"><div class="row sb ae wrapf g16"><div><span class="t-label">My workbench</span><h1 class="t-h1" style="margin-top:4px">Good morning, Tiwa</h1><div class="row g6 wrapf" style="margin-top:8px"><span class="tag h-blue">{svg("chart")} Data analyst</span><span class="tag h-pink">{svg("video")} Content creator</span><a class="t-sm pr b6" href="#">Edit roles</a></div></div>
<div class="row g24"><div><div class="t-stat">3</div><div class="t-xs su">goals done</div></div><div><div class="t-stat">14</div><div class="t-xs su">modules ticked</div></div><div><div class="t-stat">12</div><div class="t-xs su">starred</div></div></div></div>
<section class="next" style="margin-top:20px" data-da="continue-card">{tl("Power BI","lg")}<div class="fl1"><div class="k">Continue where you left off</div><div class="ttl">Power BI for analysts · Module 5: relationships and DAX</div><div class="row g10" style="margin-top:10px"><span class="prog" style="width:220px;background:var(--da-color-media-glass)"><i style="width:50%;background:var(--da-color-highlight)"></i></span><span class="t-sm" style="opacity:.7">5 of 10</span></div></div><a class="btn" href="#">Continue {svg("arrow-right")}</a></section>
<div class="row sb wrapf g8" style="margin-top:24px"><h2 class="t-h3">Suggested for you</h2><span class="t-xs su row g6">{svg("info")} Based on your roles and skills. Rules, not AI. <a class="pr b6" href="#">Why these?</a></span></div><div class="grid c3" style="margin-top:12px">{r}</div>
<div class="grid c2" style="margin-top:16px"><div class="card pad"><div class="row sb"><h3 class="t-h4">My skills</h3><a class="t-sm pr b6" href="#">All 9 →</a></div>{sk}</div>
<div class="card pad"><div class="row sb"><h3 class="t-h4">Starred</h3><a class="t-sm pr b6" href="#">All 12 →</a></div><div class="list" style="margin-top:4px">{"".join(f'<a class="li" href="#">{x}<span class="t-sm b6 fl1">{t}</span><span class="t-xs su">{k}</span></a>' for x,t,k in [(tl("Power BI","sm"),"Power BI","Tool"),(tl("Canva","sm"),"Canva","Tool"),(tile("target","violet","sm"),"Get paid by international clients","Goal"),(tile("layers","coral","sm"),"Teach kids programming","Kit")])}</div></div></div></section>'''
add('16-workbench', 'S45', 'Workbench', workbench(), tab='me', signed=True)

# 17 SIGN-IN sheet
SIGNIN = f'''<div class="scrim"></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="si" data-da="sign-in-sheet"><div class="grab"></div><div style="text-align:center;margin-top:10px">{ill("sign-in",160)}</div>
<h2 id="si" class="t-h2" style="text-align:center;margin-top:6px">Keep your progress everywhere</h2><p class="t-sm mu" style="text-align:center;margin-top:6px">Stars, ticks and kit steps follow you to any device. You can keep browsing without an account.</p>
<div class="col g10" style="margin-top:18px"><button class="btn s blk lg"><img src="{R}/assets/brand/third-party/google-g.svg" alt="" width="18" height="18"> Continue with Google</button>
<label class="input">{svg("mail")}<input placeholder="you@example.com" aria-label="Email"></label><button class="btn p blk lg">Email me a sign-in link</button><button class="btn g blk">Not now</button></div>
<p class="t-xs su" style="text-align:center;margin-top:12px">For people aged 18 and over. We never post for you or sell your data.</p></div>'''
add('17-sign-in', 'S44', 'Sign in', goal(), active='goals', tab='goals', overlay=SIGNIN)

# 18 CONSENT
def consent():
    sw = [('Save my progress', 'Stars, ticks and kit steps sync to your account.', 'bookmark'), ('Use my profile to suggest things', 'Suggestions based on your roles and skills. Rules, not AI.', 'sparkles'), ("Count me in what's trending", 'Anonymous weekly counts only. Never your name.', 'trending-up')]
    return f'''<section class="wrap" style="padding-top:28px;max-width:640px"><div class="row g6"><span class="prog pr fl1" style="height:4px"><i style="width:100%"></i></span><span class="prog pr fl1" style="height:4px"><i style="width:100%"></i></span><span class="prog fl1" style="height:4px"><i style="width:0"></i></span></div>
<h1 class="t-h1" style="margin-top:22px">You decide what we keep</h1><p class="mu" style="margin-top:6px">Everything is off until you turn it on. You can change this any time in Profile.</p>
<div class="col g12" style="margin-top:20px">{"".join(f'<div class="card pad row g12 as" data-da="consent-row">{tile(ic,"violet","sm")}<div class="fl1"><div class="b7 t-sm">{t}</div><div class="t-xs mu" style="margin-top:3px">{d}</div></div><button class="sw" role="switch" aria-checked="false" aria-label="{t}"></button></div>' for t,d,ic in sw)}</div>
<button class="btn p blk lg" style="margin-top:22px">Continue</button><p class="t-xs su" style="text-align:center;margin-top:10px">Nothing is shared until you choose.</p></section>'''
add('18-consent', 'S46', 'Consent choices', consent(), tab='me', signed=True)

# 19 PRIVACY
def privacy():
    sw = [('Save my progress', 'Stars, ticks and kit steps sync to your account.', True), ('Use my profile to suggest things', 'Roles and skills shape suggestions. Rules only, no AI.', True), ("Count me in what's trending", 'Adds your goal views to anonymous weekly counts.', False)]
    return f'''<section class="wrap" style="padding-top:28px;max-width:820px"><span class="t-label">Settings</span><h1 class="t-h1" style="margin-top:4px">Privacy and data</h1><p class="mu" style="margin-top:6px">You decide what we keep. Everything here was off until you chose it.</p>
<div class="card" style="margin-top:20px;padding:4px 20px"><div class="list">{"".join(f'<div class="row g16" style="padding:16px 0" data-da="consent-row"><div class="fl1"><div class="b7">{t}</div><div class="t-sm mu">{d}</div><div class="t-xs su" style="margin-top:4px">{"Turned on 26 Oct 2026" if on else "Off"}</div></div><button class="sw" role="switch" aria-checked="{str(on).lower()}" aria-label="{t}"></button></div>' for t,d,on in sw)}</div></div>
<div class="card pad" style="margin-top:14px"><h2 class="t-h4">What we store</h2><div class="grid c2 t-sm" style="margin-top:10px">{"".join(f'<div class="row g8"><span class="se">{svg("check")}</span>{x}</div>' for x in ["Your email and sign-in method","Roles you picked (2)","Stars (12) and ticks (14)","Your choices above, with dates"])}</div><div class="row g8 t-sm mu" style="margin-top:12px">{svg("info")} Activity is deleted after 90 days. We never sell data or show ads.</div></div>
<div class="row g12 wrapf" style="margin-top:16px"><button class="btn s">{svg("download")} Download my data</button><button class="btn s" style="color:var(--da-color-error);border-color:var(--da-color-error)">{svg("trash")} Delete my account</button></div></section>'''
add('19-privacy', 'S46', 'Privacy and data', privacy(), tab='me', signed=True)

# 20 SUGGEST
SUG = f'''<div class="scrim"></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sg" data-da="suggest-sheet"><div class="grab"></div><div class="row sb" style="margin-top:12px"><h2 id="sg" class="t-h3">Suggest an edit</h2><button class="ib" aria-label="Close">{svg("x")}</button></div><div class="t-sm mu">On: <b>Canva</b> · Price</div>
<div class="t-label" style="margin-top:16px">What's wrong?</div><div class="row g8 wrapf" style="margin-top:8px"><button class="chip sel">{svg("dollar")} Price changed</button><button class="chip">Not in my country</button><button class="chip">Broken link</button><button class="chip">Something else</button></div>
<div class="t-label" style="margin-top:16px">Tell us more</div><div class="input focus" style="margin-top:8px;align-items:flex-start;padding:14px;min-height:96px"><span class="v t-sm">Canva Pro now shows a price in naira on the pricing page.</span></div>
<div class="t-label" style="margin-top:14px">Link (optional)</div><label class="input" style="margin-top:8px">{svg("globe")}<input value="canva.com/pricing" aria-label="Source link"></label>
<div class="row g10 t-sm" style="margin-top:12px"><span class="chk" role="checkbox" aria-checked="false"></span><span class="mu">Email me when it's reviewed (we keep your email 90 days)</span></div>
<button class="btn p blk lg" style="margin-top:16px">Send suggestion</button></div>'''
add('20-suggest-edit', 'S36', 'Suggest an edit', tool(), active='explore', tab='explore', overlay=SUG)

# 21 STATUS + WHAT'S NEW
def status():
    steps = [('Received', '26 Oct, 09:12', 'done'), ('In review', 'A reviewer is checking canva.com/pricing', 'now'), ('Decision', 'Accepted, changed or declined, with a reason', ''), ('Published', "Appears in What's new", '')]
    st = ''.join(f'<li class="step {s}"><span class="n">{svg("check") if s=="done" else ""}</span><div><div class="b7 t-sm ttl" style="text-decoration:none;color:var(--da-color-ink)">{t}</div><div class="t-xs su">{d}</div></div></li>' for t, d, s in steps)
    news = [('26 Oct', 'Updated', 'h-coral', 'Uber', 'Removed for Nigeria after it ended operations on 2 Sept 2026.'), ('24 Oct', 'New', 'h-green', 'Teach kids programming', 'New kit: 9 steps from first block to Python.'), ('22 Oct', 'Checked', 'h-blue', 'Remote4Africa', 'Confirmed from a dated source.'), ('20 Oct', 'Updated', 'h-coral', 'Raenest', 'Previously known as Geegpay.')]
    n = ''.join(f'<div class="row g12 as" style="padding:14px 0"><span class="t-mono t-xs su" style="width:52px;margin-top:3px">{d}</span><span class="tag {c}" style="width:76px;justify-content:center">{k}</span><div class="fl1"><div class="b7 t-sm">{t}</div><div class="t-sm mu">{x}</div></div></div>' for d, k, c, t, x in news)
    return f'''<section class="wrap rail" style="padding-top:28px"><div class="col g16"><div><span class="t-label">What's new</span><h1 class="t-h1" style="margin-top:4px">Every change, in the open</h1></div><div class="card" style="padding:4px 20px"><div class="list">{n}</div></div></div>
<aside><span class="t-label">Your suggestion</span><h2 class="t-h2 t-mono" style="margin-top:6px;font-size:1.5rem">DA-7K2Q-91</h2><div class="t-sm mu">Canva · Price changed</div><div class="card pad" style="margin-top:14px"><ol style="list-style:none;padding:0;margin:0">{st}</ol></div><div class="t-xs su" style="margin-top:8px">Most suggestions are reviewed within 7 days.</div></aside></section>'''
add('21-status-whats-new', 'S48', "Suggestion status · What's new", status(), tab='me')

# 22 TRENDING
def trending():
    rows = [('Get a remote job that pays in dollars', 'Find work', '+12'), ('Spot scams, fake alerts and phishing', 'Stay safe', '+4'), ('Teach kids to code with blocks', 'Teach', '+19'), ('Edit a short video for free', 'Create', '−2'), ('Register a business in Nigeria', 'Business', '+6')]
    r = ''.join(f'<a class="li" href="#" style="padding:14px 0"><span class="t-h2" style="width:36px;color:{"var(--da-color-primary)" if k<3 else "var(--da-color-ink-subtle)"}">{k+1}</span><div class="fl1"><div class="b7 t-sm">{t}</div><div class="t-xs su">{c}</div></div><span class="tag {"h-green" if d[0]=="+" else "h-coral"}" style="width:52px;justify-content:center">{d}</span></a>' for k, (t, c, d) in enumerate(rows))
    return f'''<section class="wrap" style="padding-top:28px;max-width:900px"><span class="t-label">Trending · week of 19 Oct 2026</span><h1 class="t-h1" style="margin-top:4px">What people are working on</h1><p class="mu" style="margin-top:6px">Anonymous weekly counts from people who opted in. Shown only when 20 or more people are counted.</p>
<div class="seg" style="margin-top:16px"><button aria-selected="true">Nigeria</button><button>Africa</button><button>Everywhere</button></div><div class="card" style="margin-top:16px;padding:4px 20px"><div class="list">{r}</div></div></section>'''
add('22-trending', 'S47', 'Trending', trending(), tab='me', signed=True)

# 23 HOW WE REVIEW
def review():
    steps = [('Draft', 'A person or AI writes it'), ('Check', 'Facts checked against the official site'), ('Review', 'A second person signs it off'), ('Publish', 'Dated, with its source'), ('Re-check', 'Every 90 days or when reported')]
    s = ''.join(f'<div><div class="t-h1 hl">{k+1}</div><div class="b7" style="margin-top:4px">{t}</div><div class="t-sm mu">{d}</div></div>' for k, (t, d) in enumerate(steps))
    labels = f'<div class="grid c3" style="margin-top:14px"><div class="card pad"><span class="tag vchk">{svg("check")} Checked 22 Oct 2026</span><p class="t-sm mu" style="margin-top:10px">We confirmed this on a dated official source.</p></div><div class="card pad"><span class="tag vprev">{svg("eye")} Preview</span><p class="t-sm mu" style="margin-top:10px">Written from general knowledge. Not checked yet. Confirm before you pay.</p></div><div class="card pad"><div class="row g6 wrapf"><span class="tag depth-role">For your job</span><span class="tag depth-deep">In depth</span><span class="tag depth-general">General guide</span></div><p class="t-sm mu" style="margin-top:10px">How specific a learning path is to your work.</p></div></div>'
    return f'''<section class="wrap" style="padding-top:28px"><span class="t-label">How we review</span><h1 class="t-h1" style="margin-top:4px">Independent, checked and dated</h1><p class="t-lg mu" style="margin-top:6px;max-width:700px">No ads, no affiliate links, no paid placement. Here is what each label means.</p>
{labels}<div class="card pad" style="margin-top:16px"><div class="grid c4" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">{s}</div></div>
<div class="banner info" style="margin-top:16px">{ill("trust-review",120)}<div class="fl1"><b>See something wrong?</b> <span class="mu">Every page has “Suggest an edit”. You get a reference number and can follow its status.</span></div></div></section>'''
add('23-how-we-review', 'S17', 'How we review', review())

# 24-26 STATES
def state(illn, title, text, b1, b2, ref=''):
    return f'<section class="empty" data-da="state">{ill(illn)}<h1 class="t-h2" style="margin-top:18px">{title}</h1><p class="mu" style="margin-top:8px">{text}</p><div class="col g10" style="margin-top:22px"><a class="btn p blk" href="#">{b1}</a><a class="btn s blk" href="#">{b2}</a></div>{ref}</section>'
add('24-not-found', 'S24', 'Page not found', state('not-found', "We couldn't find that page", 'It may have moved. Search, or start from who you are.', 'Go home', 'Search'))
add('25-offline', 'S25', 'Offline', f'<div class="banner" style="border-radius:0;justify-content:center;background:var(--da-color-warning-soft)">{svg("wifi-off")} Offline · showing saved pages</div>' + state('offline', "You're offline", 'Pages you opened recently still work. Your ticks are saved and will sync when you are back.', 'Try again', 'Open saved pages'))
add('26-error', 'S25', 'Error', state('error', 'Something went wrong on our side', "It's not you. We've been told. Please try again in a moment.", 'Try again', 'Report a problem', '<div class="t-xs su t-mono" style="margin-top:16px">Ref: ERR-5f2a</div>'))
add('27-no-results', 'S51', 'No results', f'<section class="wrap" style="padding-top:24px"><label class="input focus">{svg("search")}<span class="v fl1">fix my generator</span>{svg("x")}</label></section>' + state('no-results', 'No digital tools for this yet', 'We cover how technology helps your work. For repairs, a qualified technician is your best bet.', 'Find a trusted tradesperson', 'Tell us what you needed'))

for fid, (sid, title, html) in S.items():
    open(f'{OUT}/{fid}.html', 'w').write(html)
idx = ''.join(f'<li><a href="{fid}.html">{fid}</a> · {sid} · {t} · <a href="{fid}.html?theme=dark">dark</a></li>' for fid, (sid, t, _) in S.items())
open(f'{OUT}/index.html', 'w').write(f'<!doctype html><meta charset="utf-8"><title>Reference screens</title><link rel="stylesheet" href="../../fonts/fonts.css"><link rel="stylesheet" href="../../tokens/tokens.css"><link rel="stylesheet" href="../../components/da.css"><main class="wrap" style="padding:32px 0"><h1 class="t-h1">Reference screens V2.8</h1><p class="mu">Open any screen and resize the window: one file covers phone, tablet and desktop. Add ?theme=dark.</p><ol class="t-sm" style="line-height:2">{idx}</ol></main>')
json.dump({fid: {'screen': sid, 'title': t} for fid, (sid, t, _) in S.items()}, open(f'{OUT}/screens.json', 'w'), indent=1)
print(len(S), 'screens')
