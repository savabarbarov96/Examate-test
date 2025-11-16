import type { WidgetData, WidgetType } from '@/utils/dashboard/types';
import statisticsApi from './client';

export type StatisticsWidgetCategory = 'charts' | 'analytics';

export interface StatisticsWidgetDefinition {
  type: WidgetType;
  title: string;
  description: string;
  defaultName: string;
  category: StatisticsWidgetCategory;
}

export async function listStatisticsWidgets(): Promise<StatisticsWidgetDefinition[]> {
  const response = await statisticsApi.get('/api/statistics/widgets');
  return response.data ?? [];
}

export async function getStatisticsWidgetDefinition(
  type: WidgetType
): Promise<StatisticsWidgetDefinition> {
  const response = await statisticsApi.get(`/api/statistics/widgets/${type}/definition`);
  return response.data;
}

export async function getStatisticsWidgetData(type: WidgetType): Promise<WidgetData> {
  const response = await statisticsApi.get(`/api/statistics/widgets/${type}`);
  return response.data;
}
