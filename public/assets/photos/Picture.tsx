// Reference responsive image. Only slugs from manifest.json are allowed.
import manifest from './manifest.json';
type Ratio = 'wide' | 'card' | 'square' | 'portrait';
export function Picture({ slug, ratio = 'card', sizes = '(min-width:1024px) 50vw, 100vw', priority = false, className }:
  { slug: keyof typeof manifest.photos; ratio?: Ratio; sizes?: string; priority?: boolean; className?: string }) {
  const p = (manifest.photos as any)[slug]; const v = p.variants[ratio];
  const set = (ext: string) => v.widths.map((w: number) => `/assets/photos/${slug}/${slug}-${ratio}-${w}.${ext} ${w}w`).join(', ');
  const w = v.widths[v.widths.length - 1]; const [a, b] = v.aspect.split('/').map(Number);
  return (
    <picture className={className} data-da="photo" data-da-slug={slug}>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img src={`/assets/photos/${slug}/${slug}-${ratio}-${v.widths[0]}.jpg`} srcSet={set('jpg')} sizes={sizes} alt={p.alt}
        width={w} height={Math.round(w * b / a)} loading={priority ? 'eager' : 'lazy'} decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        style={{ backgroundImage: `url(${v.lqip})`, backgroundSize: 'cover', objectFit: 'cover', objectPosition: `${p.focal[0]*100}% ${p.focal[1]*100}%`, width: '100%', height: '100%' }} />
    </picture>
  );
}
