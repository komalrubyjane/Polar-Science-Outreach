import { cn } from '@/lib/utils';

/** Dependency-free inline SVG sparkline for editorial data moments. */
export function Sparkline({
  points,
  width = 640,
  height = 140,
  className,
  strokeClassName = 'stroke-accent',
}: {
  points: number[];
  width?: number;
  height?: number;
  className?: string;
  strokeClassName?: string;
}) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const stepX = width / (points.length - 1);
  const y = (v: number) => height - 6 - ((v - min) / span) * (height - 12);
  const d = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${y(v)}`).join(' ');
  const area = `${d} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn('h-full w-full', className)}
      role="img"
      aria-hidden
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} className="fill-accent text-accent" fill="url(#spark-fill)" />
      <path
        d={d}
        fill="none"
        className={strokeClassName}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
