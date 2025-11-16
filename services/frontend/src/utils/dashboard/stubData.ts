/**
 * Stub Data Generator for Dashboard Widgets
 *
 * Generates fake data for testing chart visualizations
 */

import type { WidgetData, WidgetType } from './types';

// Color palette using Tailwind/shadcn colors
export const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  success: 'hsl(142.1 76.2% 36.3%)', // green-600
  warning: 'hsl(38 92% 50%)', // yellow-500
  danger: 'hsl(0 84.2% 60.2%)', // red-500
  info: 'hsl(221.2 83.2% 53.3%)', // blue-500
  purple: 'hsl(262.1 83.3% 57.8%)', // purple-500
  orange: 'hsl(24.6 95% 53.1%)', // orange-500
  teal: 'hsl(173 80% 40%)', // teal-600
  pink: 'hsl(330.4 81.2% 60.4%)', // pink-500
};

/**
 * Generate stub data based on widget type
 */
export function getStubDataForWidget(widgetType: WidgetType): WidgetData {
  switch (widgetType) {
    case 'activeAll':
      return {
        series: ['Total Participants', 'Proctored', 'Offline'],
        data: [
          { name: 'Week 1', 'Total Participants': 150, Proctored: 120, Offline: 30 },
          { name: 'Week 2', 'Total Participants': 200, Proctored: 170, Offline: 30 },
          { name: 'Week 3', 'Total Participants': 180, Proctored: 150, Offline: 30 },
          { name: 'Week 4', 'Total Participants': 220, Proctored: 190, Offline: 30 },
        ],
      };

    case 'historyAll':
      return {
        series: ['Pass', 'Fail'],
        data: [
          { name: 'Jan', Pass: 85, Fail: 15 },
          { name: 'Feb', Pass: 92, Fail: 8 },
          { name: 'Mar', Pass: 88, Fail: 12 },
          { name: 'Apr', Pass: 95, Fail: 5 },
          { name: 'May', Pass: 90, Fail: 10 },
          { name: 'Jun', Pass: 93, Fail: 7 },
        ],
      };

    case 'paidUnpaid':
      return {
        segments: [
          { name: 'Paid', value: 720, color: CHART_COLORS.success },
          { name: 'Unpaid', value: 180, color: CHART_COLORS.warning },
        ],
      };

    case 'location':
      return {
        segments: [
          { name: 'North America', value: 380, color: CHART_COLORS.info },
          { name: 'Europe', value: 290, color: CHART_COLORS.success },
          { name: 'Asia', value: 420, color: CHART_COLORS.warning },
          { name: 'South America', value: 150, color: CHART_COLORS.purple },
          { name: 'Africa', value: 90, color: CHART_COLORS.orange },
        ],
      };

    case 'proctoredOffline':
      return {
        segments: [
          { name: 'Proctored', value: 650, color: CHART_COLORS.primary },
          { name: 'Offline', value: 350, color: CHART_COLORS.secondary },
        ],
      };

    case 'passFail':
      return {
        segments: [
          { name: 'Pass', value: 842, color: CHART_COLORS.success },
          { name: 'Fail', value: 158, color: CHART_COLORS.danger },
        ],
      };

    default:
      return {};
  }
}
