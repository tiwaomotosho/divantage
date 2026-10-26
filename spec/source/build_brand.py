import json, glob, io
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from PIL import Image
import cairosvg
P='/home/claude/patch/P'; B=f'{P}/assets/brand'
T=json.load(open(f'{P}/design/tokens/tokens.json'))['color']
LP='<path d="M4 17l5-5 4 3 7-8"/><circle cx="20" cy="7" r="1.6" fill="{c}" stroke="none"/>'
def mark(bg, fg, rx=10, size=32, pad=6):
    s=(size-2*pad)/24
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">'
            + (f'<rect width="{size}" height="{size}" rx="{rx}" fill="{bg}"/>' if bg else '')
            + f'<g transform="translate({pad} {pad}) scale({s})" fill="none" stroke="{fg}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">{LP.format(c=fg)}</g></svg>\n')
# font outlines (Schibsted Grotesk 700)
fp=[f for f in glob.glob(f'{P}/design/fonts/SchibstedGrotesk/*.woff2')]
ft=None
for f in fp:
    t=TTFont(f)
    if ord('D') in t.getBestCmap(): ft=t;break
ft=instancer.instantiateVariableFont(ft,{'wght':700})
gs=ft.getGlyphSet(); cmap=ft.getBestCmap(); upm=ft['head'].unitsPerEm; hmtx=ft['hmtx']
def text_path(txt, size, tracking=-0.02):
    x=0; parts=[]; sc=size/upm
    for ch in txt:
        g=cmap[ord(ch)]; pen=SVGPathPen(gs); gs[g].draw(pen)
        d=pen.getCommands()
        if d: parts.append(f'<path transform="translate({x:.2f} 0) scale({sc:.5f} {-sc:.5f})" d="{d}"/>')
        x+=hmtx[g][0]*sc+tracking*size
    return ''.join(parts), x
def wordmark(ink, prim, onp, h=40):
    tp,w=text_path('Digital Advantage',22)
    W=int(40+12+w+2)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{h}" viewBox="0 0 {W} {h}" role="img" aria-label="Digital Advantage">'
            f'<rect width="40" height="40" rx="12.4" fill="{prim}"/><g transform="translate(9 9) scale(.9167)" fill="none" stroke="{onp}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">{LP.format(c=onp)}</g>'
            f'<g fill="{ink}" transform="translate(52 28)">{tp}</g></svg>\n')
L,D=T['light'],T['dark']
files={
 'logo-mark.svg':mark(L['primary'],L['on-primary']),
 'logo-mark-dark.svg':mark(D['primary'],D['on-primary']),
 'logo-glyph.svg':mark(None,'currentColor',size=24,pad=0).replace('stroke="currentColor"','stroke="currentColor"'),
 'logo-mark-mono-ink.svg':mark(L['ink'],'#FFFFFF'),
 'wordmark-light.svg':wordmark(L['ink'],L['primary'],L['on-primary']),
 'wordmark-dark.svg':wordmark(D['ink'],D['primary'],D['on-primary']),
}
for k,v in files.items(): open(f'{B}/{k}','w').write(v)
fav=('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><style>rect{fill:%s}path,circle{stroke:%s}circle{fill:%s}@media (prefers-color-scheme:dark){rect{fill:%s}path,circle{stroke:%s}circle{fill:%s}}</style><rect width="32" height="32" rx="9"/><g transform="translate(5 5) scale(.9167)" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17l5-5 4 3 7-8"/><circle cx="20" cy="7" r="1.6" stroke="none"/></g></svg>\n')%(L['primary'],'#fff','#fff',D['primary'],D['on-primary'],D['on-primary'])
open(f'{B}/favicon.svg','w').write(fav)
def png(svgtxt,size,out,bgpad=None):
    cairosvg.svg2png(bytestring=svgtxt.encode(),write_to=out,output_width=size,output_height=size)
for s in (16,32,48,180,192,512):
    png(mark(L['primary'],L['on-primary'],rx=7 if s<64 else 10,pad=6),s,f'{B}/icon-{s}.png')
# maskable: full-bleed bg, glyph within 60% safe zone
msk=mark(L['primary'],L['on-primary'],rx=0,size=32,pad=10)
png(msk,512,f'{B}/icon-maskable-512.png'); png(msk,192,f'{B}/icon-maskable-192.png')
import shutil; shutil.copy(f'{B}/icon-180.png',f'{B}/apple-touch-icon.png')
ims=[Image.open(f'{B}/icon-{s}.png') for s in (16,32,48)]
ims[2].save(f'{B}/favicon.ico',sizes=[(16,16),(32,32),(48,48)])
json.dump({"name":"Digital Advantage","short_name":"DigiAdv","start_url":"/","display":"standalone","background_color":L['canvas'],"theme_color":L['primary'],
 "icons":[{"src":"/assets/brand/icon-192.png","sizes":"192x192","type":"image/png"},{"src":"/assets/brand/icon-512.png","sizes":"512x512","type":"image/png"},
 {"src":"/assets/brand/icon-maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]},open(f'{B}/manifest.webmanifest','w'),indent=1)
open(f'{B}/head-snippet.html','w').write('''<link rel="icon" href="/assets/brand/favicon.ico" sizes="48x48">
<link rel="icon" href="/assets/brand/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png">
<link rel="manifest" href="/assets/brand/manifest.webmanifest">
<meta name="theme-color" content="#FBF8F3" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#110F1F" media="(prefers-color-scheme: dark)">
<meta property="og:image" content="/assets/og/og-default.png">
''')
print('brand ok')
