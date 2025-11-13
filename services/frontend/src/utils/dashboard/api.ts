/**
 * Dashboard API Functions
 */

import { io, Socket } from 'socket.io-client';
import type { DashboardWidget, WidgetType, UpdateWidgetRequest, WidgetData } from './types';
import authApi from '@/utils/auth/api';

/**
 * Get the last login timestamp for the current user
 */
export async function getLastLogin(): Promise<string | null> {
  try {
    const response = await authApi.get('/api/auth/last-login');
    return response.data.lastLogin ?? null;
  } catch (error) {
    console.error('[Dashboard API] Failed to get last login:', error);
    return null;
  }
}

/**
 * Get the current active sessions count
 */
export async function getActiveSessions(): Promise<number> {
  try {
    const response = await authApi.get('/api/session/count');
    return response.data.activeSessions ?? 0;
  } catch (error) {
    console.error('[Dashboard API] Failed to get active sessions:', error);
    return 0;
  }
}

/**
 * Subscribe to real-time active sessions updates via Socket.IO
 */
export function subscribeActiveSessions(callback: (count: number) => void): Socket {
  const socket = io(import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5000');

  socket.on('activeSessionsUpdate', (data: { activeSessions: number }) => {
    callback(data.activeSessions);
  });

  return socket;
}

/**
 * List all widgets for the current user
 */
export async function listWidgets(): Promise<DashboardWidget[]> {
  try {
    const response = await authApi.get('/api/dashboard/widgets');
    return response.data ?? [];
  } catch (error) {
    console.error('[Dashboard API] Failed to list widgets:', error);
    return [];
  }
}

/**
 * Create a new widget
 */
export async function createWidget(type: WidgetType, title?: string): Promise<DashboardWidget> {
  const response = await authApi.post('/api/dashboard/widgets', {
    type,
    title: title || 'New Widget',
  });
  return response.data;
}

/**
 * Update a widget
 */
export async function updateWidget(
  widgetId: string,
  updates: UpdateWidgetRequest
): Promise<DashboardWidget> {
  const response = await authApi.patch(`/api/dashboard/widgets/${widgetId}`, updates);
  return response.data;
}

/**
 * Delete a widget
 */
export async function deleteWidget(widgetId: string): Promise<void> {
  await authApi.delete(`/api/dashboard/widgets/${widgetId}`);
}

/**
 * Reorder widgets
 */
export async function reorderWidgets(widgetIds: string[]): Promise<DashboardWidget[]> {
  const response = await authApi.post('/api/dashboard/widgets/reorder', { widgetIds });
  return response.data ?? [];
}

/**
 * Get data for a specific widget
 */
export async function getWidgetData(widgetId: string): Promise<WidgetData> {
  const response = await authApi.get(`/api/dashboard/widgets/${widgetId}/data`);
  return response.data;
}
