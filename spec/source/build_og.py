import asyncio, json
from playwright.async_api import async_playwright
from icons import svg, logo_mark
P='/home/claude/patch/P'; R='..'
HEAD=f'<meta charset="utf-8"><link rel="stylesheet" href="../../design/fonts/fonts.css"><link rel="stylesheet" href="../../design/tokens/tokens.css"><link rel="stylesheet" href="../../design/components/da.css"><style>body{{width:1200px;height:630px;overflow:hidden;margin:0}}.og{{width:1200px;height:630px;position:relative;display:flex}}</style>'
def brand(dark=False): return f'<span class="brand"><span class="mark" style="width:48px;height:48px;border-radius:14px">{logo_mark(28)}</span><span class="wm" style="font-size:28px">Digital Advantage</span></span>'
T={
'og-default':f'''<div class="og" style="background:var(--da-color-canvas)"><div style="width:620px;padding:64px;display:flex;flex-direction:column">{brand()}<h1 class="t-display" style="font-size:64px;margin-top:auto">Find the tools people in your job use. <span class="hl">Learn them step by step.</span></h1><p class="t-lg mu" style="margin-top:18px">Free · Independent · 2,603 jobs and roles</p></div><div style="flex:1;background:url(../photos/people-collage/people-collage-portrait-960.jpg) center/cover"></div></div>''',
'og-kit-template':f'''<div class="og" style="color:#fff"><div style="position:absolute;inset:0;background:url(../photos/kids-coding/kids-coding-wide-960.jpg) center/cover"></div><div style="position:absolute;inset:0;background:linear-gradient(90deg,var(--da-color-media-scrim-strong),var(--da-color-media-scrim-clear))"></div><div class="on-media" style="position:relative;padding:64px;display:flex;flex-direction:column;width:760px">{brand().replace('class="wm"','class="wm" style="color:#fff;font-size:28px"')}<span class="tag glass" style="margin-top:auto;height:34px;font-size:16px;align-self:flex-start">{svg("layers")} Kit · 9 steps</span><h1 class="t-display" style="font-size:72px;margin-top:14px">Teach kids programming</h1></div></div>''',
'og-goal-template':f'''<div class="og" style="background:var(--da-color-canvas);padding:64px;flex-direction:column">{brand()}<div style="margin-top:auto"><span class="tag h-green" style="height:34px;font-size:16px">{svg("trending-up")} Grow</span><h1 class="t-display" style="font-size:68px;margin-top:16px;max-width:1000px">Get a remote job that pays in dollars</h1><div class="row g12" style="margin-top:26px"><img src="../tool-logos/monogram/remote4africa.svg" width="64" height="64"><img src="../tool-logos/monogram/linkedin.svg" width="64" height="64"><img src="../tool-logos/monogram/wise.svg" width="64" height="64"><span class="t-lg mu" style="margin-left:8px">and 9 more tools, ranked for you</span></div></div></div>''',
'og-tool-template':f'''<div class="og" style="background:var(--da-color-canvas);padding:64px;flex-direction:column">{brand()}<div class="row g32" style="margin-top:auto"><img src="../tool-logos/monogram/canva.svg" width="160" height="160" style="border-radius:40px"><div><h1 class="t-display" style="font-size:84px">Canva</h1><p class="t-lg mu" style="font-size:26px;margin-top:8px">Who uses it, what it costs, and how to learn it for your job</p></div></div></div>''',
}
async def m():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1228/chrome-linux64/chrome',args=['--allow-file-access-from-files'])
        pg=await b.new_page(viewport={'width':1200,'height':630})
        for k,v in T.items():
            open(f'{P}/assets/og/{k}.html','w').write(f'<!doctype html><html><head>{HEAD}</head><body>{v}</body></html>')
            await pg.goto(f'file://{P}/assets/og/{k}.html'); await pg.wait_for_timeout(400)
            await pg.screenshot(path=f'{P}/assets/og/{k}.png')
        await b.close()
asyncio.run(m()); print('og ok')
