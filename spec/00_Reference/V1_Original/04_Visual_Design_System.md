# 04 — Visual Design System

## 1. Art direction
**Concept:** “A vibrant learning adventure for real-world digital capability.”  
The interface should feel energetic, optimistic, curious, and premium. It must not resemble a generic government portal, corporate intranet, or cluttered SaaS admin panel.

### Design principles
- Joyful but not childish.
- High contrast and strong readability.
- Colourful illustrations support navigation, not decoration alone.
- Motion gives feedback and helps orientation.
- Content hierarchy remains clear on small screens.
- Reusable design tokens ensure consistent implementation across tools and teams.

## 2. Colour system
Use semantic tokens rather than hard-coding colours throughout components. The palette below is a starting direction; validate contrast in actual components before final approval.

- `color.ink`: deep blue-black for primary text.
- `color.canvas`: warm near-white background.
- `color.surface`: white/near-white card surfaces.
- `color.primary`: saturated indigo/violet for primary actions.
- `color.secondary`: lively teal for discovery and supporting actions.
- `color.accent`: warm amber/coral for highlights and achievement moments.
- `color.success`, `color.warning`, `color.error`, `color.info`: semantic status colours.
- `color.border`: subtle neutral border.
- `color.mutedText`: secondary text with accessible contrast.
- `color.focus`: clearly visible keyboard focus ring.

Do not use colour alone to encode categories or states. Pair colour with text, icons, and shape. Avoid large areas of saturated colour behind long paragraphs.

## 3. Typography
- Use a highly legible modern sans-serif family with broad language coverage.
- Use a display style for the hero headline and a highly readable text style for body copy.
- Avoid using more than two font families without a clear reason.
- Establish tokens for display, heading 1–4, body large, body, small, label, and code.
- Body text should remain comfortably readable on mobile; avoid tiny metadata.
- Use line lengths that support scanning, especially on desktop.
- Do not use all-caps for long labels or paragraphs.

Suggested hierarchy:
- Hero headline: expressive, bold, compact line height.
- Page heading: strong and clear.
- Section heading: distinct but subordinate.
- Card title: concise, scannable.
- Body: comfortable line spacing.
- Metadata: smaller but still legible and contrast-compliant.

## 4. Layout and spacing
Use a consistent spacing scale based on multiples of 4 or 8. Define tokens rather than arbitrary margins. Establish:
- content max-width;
- reading max-width;
- page gutters;
- section spacing;
- card padding;
- grid gaps;
- sticky header height;
- mobile safe-area padding.

Desktop should use a centered content container with generous whitespace. Tablet uses fewer columns. Mobile prioritises vertical flow and touch targets. Avoid layouts that depend on exact viewport dimensions or fixed-height text containers.

## 5. Shape and illustration
- Use rounded cards and soft, consistent radii.
- Create a small family of category illustrations/icons with a unified visual language.
- Use abstract paths, stars, sparks, nodes, maps, or progress motifs sparingly to reinforce discovery.
- Avoid unrelated stock imagery on every card.
- Avoid using third-party logos unless use is permitted and the asset is sourced appropriately.
- Provide text labels for all important categories.

## 6. Core components
- Global header and mobile navigation.
- Search input with clear button and accessible label.
- Search suggestion panel.
- Audience/path card.
- Category tile.
- Tool card.
- Resource card.
- Pricing/access badge (neutral styling by default).
- Review-date/source row.
- Filter chip and filter drawer.
- Sort control.
- Stepper/timeline.
- Workflow step card.
- Learning module row.
- Comparison table.
- Related content section.
- Feedback/correction form.
- Toast/inline alert.
- Skeleton loader.
- Empty-state panel.
- Error/retry panel.
- Footer.
- Optional bookmark control.
- Optional progress indicator.

Each component must have documented responsive behaviour, accessibility semantics, and state variations.

## 7. Motion and transitions
Motion should make the platform feel alive while remaining fast and respectful.

### Motion rules
- Use short, purposeful transitions; avoid long intro animations.
- Typical micro-interactions may fall around 120–220 ms; larger layout transitions may be somewhat longer if they remain responsive.
- Prefer opacity and transform for animation; avoid expensive layout thrashing.
- Cards may lift slightly on hover on pointer devices, but must not rely on hover for essential information.
- Search suggestions should appear and disappear predictably.
- Filters should update with clear feedback and preserve state where practical.
- Page transitions must not delay access to content.
- Use skeletons only when they help communicate loading; avoid flashing placeholders for very fast loads.
- Avoid auto-playing audio/video.
- Do not use infinite motion that distracts from reading.

### Reduced motion
Respect `prefers-reduced-motion`. Disable or simplify non-essential movement and provide immediate state changes when appropriate. Avoid parallax and motion that can cause discomfort.

### Performance
Animate only when it does not compromise responsiveness. Lazy-load non-critical decorative assets. Do not ship large animation libraries for a handful of simple transitions.

## 8. Responsive behaviour
Define breakpoints in implementation based on content needs, not particular device brands. Test narrow phones, large phones, tablets, laptops, and wide screens.

- No horizontal overflow for core page content.
- Search remains prominent.
- Cards reflow from multi-column to one/two-column layouts.
- Tables on mobile should become readable stacked comparisons or use a carefully labelled scroll container.
- Navigation switches to a mobile pattern without losing key destinations.
- Touch targets should be comfortably sized; target approximately 44×44 CSS pixels where practical.
- Respect device safe areas.
- Images and embedded media must scale within their containers.

## 9. Accessibility
Target WCAG 2.2 AA as the quality goal, subject to formal audit.
- Semantic HTML and logical heading hierarchy.
- Keyboard-accessible navigation and controls.
- Visible focus.
- Sufficient text and non-text contrast.
- Accessible names for icon buttons.
- Correct form labels and error associations.
- Screen-reader announcements for dynamic search/filter results where appropriate.
- Alt text for meaningful images; decorative images hidden from assistive technology.
- Captions/transcripts for owned video/audio content where available.
- Do not rely on colour, hover, or animation alone.
- Support browser zoom and text resizing.
- Reduced-motion support.
- Test with keyboard and at least one screen reader.

## 10. Dark mode
Dark mode may be included if it can be implemented and tested correctly. It is not more important than search, content quality, responsiveness, and accessibility. Use semantic tokens for both themes and verify contrast independently.

## 11. Design handoff requirements
Every screen design should specify:
- desktop, tablet, and mobile states;
- spacing and typography tokens;
- component states;
- empty/loading/error states;
- keyboard/focus behaviour;
- motion and reduced-motion behaviour;
- content examples;
- responsive rules;
- accessibility notes;
- asset names and usage rights.

Do not accept a static mockup as a complete design specification.
