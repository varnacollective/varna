"use client";

/**
 * FlowConnector: Animated SVG connector with traveling dash pulse.
 *
 * Renders a horizontal or vertical SVG line/path between flow nodes
 * with a looping dash animation that communicates "live calculation."
 *
 * Usage:
 *   <FlowConnector direction="horizontal" color="#7A3F1E" />
 *   <FlowConnector direction="vertical" length={48} />
 */

interface FlowConnectorProps {
  direction?: "horizontal" | "vertical";
  length?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export default function FlowConnector({
  direction = "horizontal",
  length = 48,
  color = "#7A3F1E",
  strokeWidth = 1.5,
  className = "",
}: FlowConnectorProps) {
  const isH = direction === "horizontal";
  const w = isH ? length : strokeWidth + 8;
  const h = isH ? strokeWidth + 8 : length;
  const x1 = isH ? 0 : w / 2;
  const y1 = isH ? h / 2 : 0;
  const x2 = isH ? w : w / 2;
  const y2 = isH ? h / 2 : h;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className={`flex-shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* Static track */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeOpacity={0.2}
      />
      {/* Animated traveling dash */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray="6 10"
        strokeLinecap="round"
        className="animate-flow-dash"
      />
    </svg>
  );
}
