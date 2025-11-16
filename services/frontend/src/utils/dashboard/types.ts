/**
 * Dashboard Widget Types
 */

export type WidgetType =
  | 'activeAll'
  | 'paidUnpaid'
  | 'location'
  | 'historyAll'
  | 'passFail'
  | 'proctoredOffline';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  order: number;
  client: string;
  legendVisibility?: Record<string, boolean> | Map<string, boolean>;
  dataSourceParams?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateWidgetRequest {
  title?: string;
  legendVisibility?: Record<string, boolean>;
  order?: number;
  dataSourceParams?: Record<string, unknown>;
}

export interface CreateWidgetRequest {
  type: WidgetType;
  title?: string;
  dataSourceParams?: Record<string, unknown>;
}

// Chart-specific data types
export interface BarChartDataPoint {
  name: string;
  [key: string]: string | number; // Series values
}

export interface PieChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface WidgetData {
  // Bar chart data (activeAll, historyAll)
  series?: string[]; // e.g., ["Series A", "Series B", "Series C"]
  data?: BarChartDataPoint[];

  // Pie/Doughnut chart data (paidUnpaid, location, proctoredOffline, passFail)
  segments?: PieChartDataPoint[];

  // Flexible for future extensions
  [key: string]: unknown;
}
