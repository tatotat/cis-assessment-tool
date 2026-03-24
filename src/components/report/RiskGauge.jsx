import React from 'react';
import { getORILevel, getORIDescription } from '../../lib/calculations';

const GAUGE_COLORS = {
  low: '#22c55e',
  moderate: '#eab308',
  elevated: '#f97316',
  critical: '#ef4444',
  unknown: '#9ca3af',
};

const GAUGE_LABELS = {
  low: 'Low Risk',
  moderate: 'Moderate Risk',
  elevated: 'Elevated Risk',
  critical: 'Critical Risk',
  unknown: 'Unknown',
};

export default function RiskGauge({ ori, size = 200 }) {
  const level = getORILevel(ori);
  const color = GAUGE_COLORS[level];
  const description = getORIDescription(ori);
  const label = GAUGE_LABELS[level];

  // SVG gauge parameters
  const cx = size / 2;
  const cy = size / 2 + 10;
  const r = (size / 2) - 20;
  const strokeWidth = 16;

  // Half circle (180 degrees) from left to right
  const startAngle = 180;
  const endAngle = 0;

  function polarToCart(cx, cy, r, angleDeg) {
    const rad = ((angleDeg - 180) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  function describeArc(cx, cy, r, startDeg, endDeg) {
    const start = polarToCart(cx, cy, r, endDeg);
    const end = polarToCart(cx, cy, r, startDeg);
    const largeArcFlag = endDeg - startDeg <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  }

  // ORI is 0-100, lower is better; map to gauge fill (0=full green, 100=full red)
  const fillPct = ori !== null && ori !== undefined ? Math.min(Math.max(ori, 0), 100) : 0;
  const fillAngle = startAngle - (fillPct / 100) * 180;

  const bgPath = describeArc(cx, cy, r, endAngle, startAngle);
  const fillPath = describeArc(cx, cy, r, fillAngle, startAngle);

  // Needle
  const needleAngle = startAngle - (fillPct / 100) * 180;
  const needleRad = ((needleAngle - 180) * Math.PI) / 180;
  const needleLen = r - 8;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy + needleLen * Math.sin(needleRad);

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size / 2 + 30}
        viewBox={`0 0 ${size} ${size / 2 + 30}`}
        className="overflow-visible"
      >
        {/* Background track */}
        <path
          d={bgPath}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Colored zones */}
        {[
          { from: 180, to: 135, color: '#22c55e' },
          { from: 135, to: 90, color: '#eab308' },
          { from: 90, to: 45, color: '#f97316' },
          { from: 45, to: 0, color: '#ef4444' },
        ].map((zone, i) => (
          <path
            key={i}
            d={describeArc(cx, cy, r, zone.to, zone.from)}
            fill="none"
            stroke={zone.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity="0.25"
          />
        ))}

        {/* Active fill */}
        {ori !== null && ori !== undefined && (
          <path
            d={fillPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}

        {/* Needle */}
        {ori !== null && ori !== undefined && (
          <>
            <line
              x1={cx}
              y1={cy}
              x2={nx}
              y2={ny}
              stroke="#374151"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
            <circle cx={cx} cy={cy} r={5} fill="#374151" />
          </>
        )}

        {/* Scale labels */}
        <text x={20} y={cy + 20} fill="#9ca3af" fontSize="10" textAnchor="middle">0</text>
        <text x={size - 20} y={cy + 20} fill="#9ca3af" fontSize="10" textAnchor="middle">100</text>
        <text x={cx} y={cy - r - 8} fill="#9ca3af" fontSize="10" textAnchor="middle">50</text>
      </svg>

      {/* ORI value */}
      <div className="text-center mt-1">
        <div className="text-4xl font-bold" style={{ color }}>
          {ori !== null && ori !== undefined ? ori.toFixed(1) : '--'}
        </div>
        <div className="text-sm font-semibold mt-1" style={{ color }}>{label}</div>
        <div className="text-xs text-gray-500 mt-1 max-w-xs text-center">{description}</div>
      </div>
    </div>
  );
}
