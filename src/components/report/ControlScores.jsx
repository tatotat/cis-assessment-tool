import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { getControlScores, getRiskLevel } from '../../lib/calculations';

const RISK_COLORS = {
  acceptable: '#22c55e',
  unacceptable: '#eab308',
  high: '#ef4444',
};

function getBarColor(score, igLevel) {
  const level = getRiskLevel(score, igLevel);
  return RISK_COLORS[level] || '#9ca3af';
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-white border rounded-lg shadow-lg p-3 max-w-xs">
      <div className="font-semibold text-gray-800 text-sm">Control {data.control}</div>
      <div className="text-xs text-gray-600 mt-0.5 mb-2">{data.name}</div>
      <div className="text-sm">
        <span className="text-gray-600">Avg Score: </span>
        <span className="font-bold">{data.avgScore}</span>
        <span className="text-gray-400 text-xs"> / {data.maxScore}</span>
      </div>
      <div className="text-sm">
        <span className="text-gray-600">Safeguards: </span>
        <span className="font-bold">{data.count}</span>
      </div>
    </div>
  );
}

export default function ControlScores({ responses, igLevel }) {
  const controlData = getControlScores(responses, igLevel);

  if (!controlData || controlData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
        No scored responses available.
      </div>
    );
  }

  const threshold = igLevel === 1 ? 6 : 9;

  return (
    <div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={controlData}
          margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
          barSize={24}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis
            dataKey="control"
            tickFormatter={(v) => `C${v}`}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            angle={-45}
            textAnchor="end"
            height={50}
          />
          <YAxis
            domain={[0, igLevel === 1 ? 9 : 25]}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={threshold}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            label={{ value: 'Threshold', position: 'right', fontSize: 10, fill: '#f59e0b' }}
          />
          <Bar dataKey="avgScore" radius={[4, 4, 0, 0]}>
            {controlData.map((entry) => (
              <Cell
                key={`cell-${entry.control}`}
                fill={getBarColor(entry.avgScore, igLevel)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 justify-center text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Acceptable</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>Unacceptable</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>High Risk</span>
        </div>
      </div>
    </div>
  );
}
