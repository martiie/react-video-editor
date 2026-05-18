export type Point = { x: number; y: number };

// ─── Douglas-Peucker simplification ───────────────────────────────────────

function perpDistance(pt: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0 && dy === 0) return Math.hypot(pt.x - a.x, pt.y - a.y);
  const t = ((pt.x - a.x) * dx + (pt.y - a.y) * dy) / (dx * dx + dy * dy);
  return Math.hypot(pt.x - a.x - t * dx, pt.y - a.y - t * dy);
}

export function simplifyPoints(points: Point[], tolerance = 1.5): Point[] {
  if (points.length <= 2) return points;
  let maxDist = 0;
  let maxIdx = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpDistance(points[i], points[0], points[points.length - 1]);
    if (d > maxDist) {
      maxDist = d;
      maxIdx = i;
    }
  }
  if (maxDist > tolerance) {
    const left = simplifyPoints(points.slice(0, maxIdx + 1), tolerance);
    const right = simplifyPoints(points.slice(maxIdx), tolerance);
    return [...left.slice(0, -1), ...right];
  }
  return [points[0], points[points.length - 1]];
}

// ─── Catmull-Rom → cubic bezier smooth path ────────────────────────────────

export function toSmoothPath(points: Point[]): string {
  if (points.length === 0) return "";
  if (points.length === 1)
    return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  if (points.length === 2) {
    return (
      `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} ` +
      `L ${points[1].x.toFixed(2)} ${points[1].y.toFixed(2)}`
    );
  }

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Catmull-Rom control points → cubic bezier
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

// ─── Path length approximation ─────────────────────────────────────────────
// Sums chord distances then applies a correction factor for bezier curves.

export function approximatePathLength(points: Point[]): number {
  if (points.length < 2) return 0;
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += Math.hypot(
      points[i].x - points[i - 1].x,
      points[i].y - points[i - 1].y
    );
  }
  // Bezier arcs are slightly longer than chord sums
  return length * 1.05;
}

// ─── Exact length via hidden SVG path element ──────────────────────────────
// Call this once after the stroke is committed; requires a DOM environment.

export function measureSvgPathLength(d: string): number {
  try {
    const svgNS = "http://www.w3.org/2000/svg";
    const el = document.createElementNS(svgNS, "path") as SVGPathElement;
    el.setAttribute("d", d);
    el.style.visibility = "hidden";
    el.style.position = "absolute";
    document.body.appendChild(el);
    const len = el.getTotalLength();
    document.body.removeChild(el);
    return len || 1;
  } catch {
    return 1;
  }
}
