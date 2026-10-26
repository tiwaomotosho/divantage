// Reference Icon component. Size follows tokens: 16 (sm), 20 (md), 24 (lg).
import { ICONS, type IconName } from './icons';
type Props = { name: IconName; size?: 16 | 18 | 20 | 24 | 32; className?: string; label?: string };
export function Icon({ name, size = 20, className, label }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={name === 'play' ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}
      data-da-icon={name} dangerouslySetInnerHTML={{ __html: ICONS[name] }} />
  );
}
