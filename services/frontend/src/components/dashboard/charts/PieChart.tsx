/**
 * PieChart Component
 *
 * Renders pie or doughnut chart with interactive legend
 * Used for: passFail (pie), paidUnpaid, location, proctoredOffline (doughnut)
 */

import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { PieChartDataPoint } from '@/utils/dashboard/types';

interface PieChartProps {
  segments: PieChartDataPoint[];
  legendKeys?: Record<string, boolean>;
  onLegendToggle?: (key: string) => void;
  isDoughnut?: boolean;
  showPercentage?: boolean; // For passFail, show percentages in tooltip
}

/**
 * Custom Tooltip Component
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  showPercentage?: boolean;
}

const CustomTooltip = ({ active, payload, showPercentage }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  const { name, value, percent } = data;

  return (
    <div className="bg-background border border-border rounded-md shadow-lg p-3">
      <div className="flex items-center gap-2 text-sm">
        <div
          className="w-3 h-3 rounded-sm"
          style={{ backgroundColor: data.payload.fill }}
        />
        <span className="font-semibold">{name}:</span>
        <span className="font-medium">
          {showPercentage
            ? `${(percent * 100).toFixed(1)}%`
            : value.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

/**
 * Custom Legend Component with Toggle
 */
interface CustomLegendProps {
  segments: PieChartDataPoint[];
  legendKeys: Record<string, boolean>;
  onToggle: (key: string) => void;
}

const CustomLegend = ({ segments, legendKeys, onToggle }: CustomLegendProps) => {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-4">
      {segments.map((segment) => {
        const isActive = legendKeys[segment.name] !== false;
        return (
          <button
            key={segment.name}
            onClick={() => onToggle(segment.name)}
            className={`flex items-center gap-2 text-sm transition-opacity ${
              isActive ? 'opacity-100' : 'opacity-40'
            } hover:opacity-100`}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className={isActive ? 'font-medium' : 'text-muted-foreground'}>
              {segment.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default function PieChart({
  segments,
  legendKeys = {},
  onLegendToggle,
  isDoughnut = false,
  showPercentage = false,
}: PieChartProps) {
  const handleLegendToggle = (key: string) => {
    onLegendToggle?.(key);
  };

  // Filter active segments
  const activeSegments = segments.filter((s) => legendKeys[s.name] !== false);

  return (
    <div className="w-full h-full flex flex-col">
      <ResponsiveContainer width="100%" height="85%">
        <RechartsPieChart>
          <Pie
            data={activeSegments}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius="80%"
            innerRadius={isDoughnut ? "50%" : "0%"}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {activeSegments.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip showPercentage={showPercentage} />} />
        </RechartsPieChart>
      </ResponsiveContainer>
      <CustomLegend
        segments={segments}
        legendKeys={legendKeys}
        onToggle={handleLegendToggle}
      />
    </div>
  );
}
