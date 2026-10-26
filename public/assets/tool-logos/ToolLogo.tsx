// Reference ToolLogo. Override wins if present; else monogram. Sizes: sm 32, md 44, lg 72 (tokens.layout.tool-logo*).
import index from './index.json';
export function ToolLogo({ slug, size = 'md' }: { slug: string; size?: 'sm' | 'md' | 'lg' }) {
  const t = (index.tools as any)[slug];
  const px = { sm: 32, md: 44, lg: 72 }[size];
  return <img data-da="tool-logo" className={`tl ${size === 'md' ? '' : size}`} src={t?.override ?? t?.src} alt="" width={px} height={px} />;
}
