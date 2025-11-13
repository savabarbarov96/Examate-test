/**
 * HorizontalBarChart Component
 *
 * Renders horizontal bar chart with interactive legend
 * Used for: activeAll, historyAll
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import type { BarChartDataPoint } from '@/utils/dashboard/types';
import { CHART_COLORS } from '@/utils/dashboard/stubData';

interface HorizontalBarChartProps {
  data: BarChartDataPoint[];
  series: string[];
  legendKeys?: Record<string, boolean>;
  onLegendToggle?: (key: string) => void;
}

// Predefined color palette for series
const SERIES_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.info,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.purple,
  CHART_COLORS.orange,
  CHART_COLORS.teal,
  CHART_COLORS.pink,
];

/**
 * Custom Tooltip Component
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-background border border-border rounded-md shadow-lg p-3">
      <p className="font-semibold text-sm mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

/**
 * Custom Legend Component with Toggle
 */
interface CustomLegendProps {
  series: string[];
  legendKeys: Record<string, boolean>;
  onToggle: (key: string) => void;
  colors: string[];
}

const CustomLegend = ({ series, legendKeys, onToggle, colors }: CustomLegendProps) => {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-4">
      {series.map((seriesName, index) => {
        const isActive = legendKeys[seriesName] !== false;
        return (
          <button
            key={seriesName}
            onClick={() => onToggle(seriesName)}
            className={`flex items-center gap-2 text-sm transition-opacity ${
              isActive ? 'opacity-100' : 'opacity-40'
            } hover:opacity-100`}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className={isActive ? 'font-medium' : 'text-muted-foreground'}>
              {seriesName}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default function HorizontalBarChart({
  data,
  series,
  legendKeys = {},
  onLegendToggle,
}: HorizontalBarChartProps) {
  const handleLegendToggle = (key: string) => {
    onLegendToggle?.(key);
  };

  // Filter active series
  const activeSeries = series.filter((s) => legendKeys[s] !== false);

  return (
    <div className="w-full h-full flex flex-col">
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis type="number" className="text-xs" />
          <YAxis dataKey="name" type="category" className="text-xs" width={60} />
          <Tooltip content={<CustomTooltip />} />
          {series.map((seriesName, index) => {
            const isActive = legendKeys[seriesName] !== false;
            return (
              <Bar
                key={seriesName}
                dataKey={seriesName}
                fill={SERIES_COLORS[index % SERIES_COLORS.length]}
                hide={!isActive}
                label={{ position: 'right', fontSize: 11 }}
              />
            );
          })}
        </BarChart>
      </ResponsiveContainer>
      <CustomLegend
        series={series}
        legendKeys={legendKeys}
        onToggle={handleLegendToggle}
        colors={SERIES_COLORS}
      />
    </div>
  );
}
