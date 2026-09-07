/**
 * Ambient falling-snow overlay.
 *
 * Three parallax layers of tiled radial-gradient flakes, animated with
 * `transform` only (GPU-composited). Fixed, `pointer-events: none`, and
 * `aria-hidden` so it never interferes with layout, input or assistive tech.
 * All motion is defined in `globals.css` and is disabled under
 * `prefers-reduced-motion` — this component renders no JS behaviour.
 */
export function SnowLayer() {
  return (
    <div className="snow-layer" aria-hidden="true">
      <i className="snow-far" />
      <i className="snow-mid" />
      <i className="snow-near" />
    </div>
  );
}
