import asyncio, json, os, sys
from playwright.async_api import async_playwright
P='/home/claude/patch/P'; SC=f'{P}/design/reference/screens'; OUT=f'{P}/design/reference/png'; PREV='/home/claude/patch/build/prev'
os.makedirs(OUT,exist_ok=True); os.makedirs(PREV,exist_ok=True)
VP={'phone':(390,844),'tablet':(834,1194),'desktop':(1440,900)}
JOBS=[('phone','light'),('phone','dark'),('desktop','light'),('desktop','dark'),('tablet','light')]
only=sys.argv[1:] 
FP="""() => { const q=s=>document.querySelector(s); const cs=(s,p)=>{const e=q(s);return e?getComputedStyle(e)[p]:null};
 return {
  'body.background': cs('body','backgroundColor'), 'body.font': cs('body','fontFamily'),
  'h1.font': cs('h1','fontFamily'), 'h1.weight': cs('h1','fontWeight'),
  'primary.bg': cs('.btn.p','backgroundColor'), 'primary.radius': cs('.btn.p','borderTopLeftRadius'), 'primary.height': cs('.btn.p','height'),
  'card.radius': cs('.card','borderTopLeftRadius'), 'card.border': cs('.card','borderTopColor'),
  'tabbar.height': cs('[data-da=tabbar]','height'), 'tabbar.display': cs('[data-da=tabbar]','display'),
  'header.height': cs('[data-da=header] .in','height') } }"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1228/chrome-linux64/chrome',args=['--allow-file-access-from-files'])
        screens=json.load(open(f'{SC}/screens.json'))
        anat={}; fpr={}
        for fid in screens:
            if only and fid not in only: continue
            os.makedirs(f'{OUT}/{fid}',exist_ok=True)
            for vp,th in JOBS:
                w,h=VP[vp]
                ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=1 if vp=='desktop' else 2,color_scheme=th,has_touch=vp!='desktop')
                pg=await ctx.new_page()
                await pg.goto(f'file://{SC}/{fid}.html?theme={th}'); await pg.wait_for_load_state('networkidle'); await pg.wait_for_timeout(250)
                await pg.screenshot(path=f'{OUT}/{fid}/{vp}-{th}.png',full_page=True)
                await pg.screenshot(path=f'{PREV}/{fid}--{vp}-{th}.png')
                ov=await pg.evaluate('()=>document.documentElement.scrollWidth-window.innerWidth')
                if ov>0: print('OVERFLOW',fid,vp,ov)
                if th=='light':
                    da=await pg.evaluate("()=>{const o={};document.querySelectorAll('[data-da]').forEach(e=>{const r=e.getBoundingClientRect();const vis=getComputedStyle(e).display!=='none'&&r.width>0;if(vis)o[e.dataset.da]=(o[e.dataset.da]||0)+1});return o}")
                    anat.setdefault(fid,{'screen':screens[fid]['screen'],'required':{}})['required'][vp]=da
                    fpr.setdefault(fid,{})[vp]=await pg.evaluate(FP)
                    # touch target audit
                    small=await pg.evaluate("()=>[...document.querySelectorAll('a,button,[role=switch],[role=checkbox],input')].filter(e=>{const r=e.getBoundingClientRect();const st=getComputedStyle(e);return st.display!=='none'&&st.visibility!=='hidden'&&r.width>0&&r.height>0&&(r.height<24||r.width<24)&&!(e.tagName==='A'&&getComputedStyle(e).display==='inline')}).map(e=>e.outerHTML.slice(0,80))")
                    if small and vp=='phone': print('small targets',fid,len(small),small[:2])
                await ctx.close()
            print('ok',fid)
        if not only:
            json.dump(anat,open(f'{P}/design/reference/anatomy.json','w'),indent=1)
            json.dump(fpr,open(f'{P}/design/reference/style-fingerprint.json','w'),indent=1)
        await b.close()
asyncio.run(main())
