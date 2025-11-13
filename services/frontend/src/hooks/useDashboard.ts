/**
 * useDashboard Hook
 *
 * Comprehensive dashboard state management hook that handles:
 * - Last login timestamp
 * - Real-time active sessions count (via Socket.IO)
 * - Dashboard widgets CRUD operations
 * - Widget data fetching and refreshing
 * - Legend visibility toggling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import type { DashboardWidget, WidgetType, UpdateWidgetRequest } from '@/utils/dashboard/types';
import {
  getLastLogin,
  getActiveSessions,
  subscribeActiveSessions,
  listWidgets,
  createWidget as apiCreateWidget,
  updateWidget as apiUpdateWidget,
  deleteWidget as apiDeleteWidget,
  reorderWidgets as apiReorderWidgets,
  getWidgetData,
} from '@/utils/dashboard/api';

const normalizeLegendVisibility = (
  legend?: DashboardWidget['legendVisibility']
): Record<string, boolean> => {
  if (!legend) {
    return {};
  }

  if (legend instanceof Map) {
    return Object.fromEntries(legend.entries());
  }

  return legend;
};

const normalizeWidgets = (widgets: DashboardWidget[]): DashboardWidget[] =>
  widgets.map((widget) => ({
    ...widget,
    legendVisibility: normalizeLegendVisibility(widget.legendVisibility),
  }));

interface UseDashboardState {
  lastLogin: string | null;
  activeSessions: number;
  widgets: DashboardWidget[];
  loading: boolean;
  error: string | null;
}

interface UseDashboardActions {
  /**
   * Create a new widget
   * @param type Widget type
   * @param name Optional custom name
   */
  create: (type: WidgetType, name?: string) => Promise<void>;

  /**
   * Rename a widget
   * @param id Widget ID
   * @param name New name
   */
  rename: (id: string, name: string) => Promise<void>;

  /**
   * Update a widget with partial updates
   * @param id Widget ID
   * @param updates Partial widget updates
   */
  update: (id: string, updates: UpdateWidgetRequest) => Promise<void>;

  /**
   * Delete a widget
   * @param id Widget ID
   */
  delete: (id: string) => Promise<void>;

  /**
   * Reorder widgets
   * @param widgetIds Array of widget IDs in desired order
   */
  reorder: (widgetIds: string[]) => Promise<void>;

  /**
   * Toggle legend key visibility for a widget
   * @param widgetId Widget ID
   * @param legendKey Legend key to toggle
   */
  toggleLegend: (widgetId: string, legendKey: string) => Promise<void>;

  /**
   * Refresh all dashboard data
   */
  refreshData: () => Promise<void>;

  /**
   * Refresh data for a specific widget
   * @param widgetId Widget ID
   */
  refreshWidgetData: (widgetId: string) => Promise<void>;
}

interface UseDashboardReturn extends UseDashboardState {
  actions: UseDashboardActions;
}

/**
 * Dashboard hook for managing all dashboard-related state and operations
 */
export function useDashboard(): UseDashboardReturn {
  const [state, setState] = useState<UseDashboardState>({
    lastLogin: null,
    activeSessions: 0,
    widgets: [],
    loading: true,
    error: null,
  });

  const socketRef = useRef<Socket | null>(null);
  const mountedRef = useRef(true);

  /**
   * Safe state update that checks if component is mounted
   */
  const safeSetState = useCallback((updates: Partial<UseDashboardState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  /**
   * Fetch initial dashboard data
   */
  const fetchInitialData = useCallback(async () => {
    try {
      safeSetState({ loading: true, error: null });

      // Fetch all data in parallel
      const [lastLogin, activeSessions, widgets] = await Promise.all([
        getLastLogin().catch(() => null),
        getActiveSessions().catch(() => 0),
        listWidgets().catch(() => []),
      ]);

      const stubWidgets: DashboardWidget[] = [
        {
          id: 'stub-1',
          type: 'activeAll',
          title: 'Active Exams Overview',
          order: 0,
          client: 'demo',
          legendVisibility: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'stub-2',
          type: 'historyAll',
          title: 'Exam History',
          order: 1,
          client: 'demo',
          legendVisibility: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'stub-3',
          type: 'paidUnpaid',
          title: 'Paid vs Unpaid',
          order: 2,
          client: 'demo',
          legendVisibility: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'stub-4',
          type: 'location',
          title: 'Exams by Location',
          order: 3,
          client: 'demo',
          legendVisibility: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'stub-5',
          type: 'proctoredOffline',
          title: 'Proctored vs Offline',
          order: 4,
          client: 'demo',
          legendVisibility: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'stub-6',
          type: 'passFail',
          title: 'Pass vs Fail',
          order: 5,
          client: 'demo',
          legendVisibility: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const finalWidgets = widgets.length === 0 ? stubWidgets : widgets;
      const normalized = normalizeWidgets(finalWidgets);

      safeSetState({
        lastLogin,
        activeSessions,
        widgets: normalized,
        loading: false,
      });
    } catch (error) {
      console.error('[useDashboard] Failed to fetch initial data:', error);
      safeSetState({
        error: error instanceof Error ? error.message : 'Failed to load dashboard data',
        loading: false,
      });
    }
  }, [safeSetState]);

  /**
   * Subscribe to real-time session updates
   */
  const setupSocketSubscription = useCallback(() => {
    try {
      socketRef.current = subscribeActiveSessions((count) => {
        safeSetState({ activeSessions: count });
      });
    } catch (error) {
      console.error('[useDashboard] Failed to setup socket subscription:', error);
    }
  }, [safeSetState]);

  /**
   * Initialize dashboard on mount
   */
  useEffect(() => {
    mountedRef.current = true;

    // Fetch initial data
    fetchInitialData();

    // Setup socket subscription
    setupSocketSubscription();

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [fetchInitialData, setupSocketSubscription]);

  /**
   * Create a new widget
   */
  const create = useCallback(async (type: WidgetType, title?: string) => {
    try {
      safeSetState({ error: null });
      await apiCreateWidget(type, title);

      // Re-fetch widgets to ensure we have the latest state
      const updatedWidgets = await listWidgets();
      safeSetState({ widgets: normalizeWidgets(updatedWidgets) });
    } catch (error) {
      console.error('[useDashboard] Failed to create widget:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create widget';
      safeSetState({ error: errorMessage });
      throw error;
    }
  }, [safeSetState]);

  /**
   * Rename a widget
   */
  const rename = useCallback(async (id: string, name: string) => {
    try {
      safeSetState({ error: null });
      await apiUpdateWidget(id, { title: name });

      // Re-fetch widgets to ensure we have the latest state
      const updatedWidgets = await listWidgets();
      safeSetState({ widgets: normalizeWidgets(updatedWidgets) });
    } catch (error) {
      console.error('[useDashboard] Failed to rename widget:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to rename widget';
      safeSetState({ error: errorMessage });
      throw error;
    }
  }, [safeSetState]);

  /**
   * Update a widget with partial updates
   */
  const update = useCallback(async (id: string, updates: UpdateWidgetRequest) => {
    try {
      safeSetState({ error: null });
      await apiUpdateWidget(id, updates);

      // Re-fetch widgets to ensure we have the latest state
      const updatedWidgets = await listWidgets();
      safeSetState({ widgets: normalizeWidgets(updatedWidgets) });
    } catch (error) {
      console.error('[useDashboard] Failed to update widget:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update widget';
      safeSetState({ error: errorMessage });
      throw error;
    }
  }, [safeSetState]);

  /**
   * Delete a widget
   */
  const deleteWidget = useCallback(async (id: string) => {
    try {
      safeSetState({ error: null });
      await apiDeleteWidget(id);

      // Re-fetch widgets to ensure we have the latest state
      const updatedWidgets = await listWidgets();
      safeSetState({ widgets: normalizeWidgets(updatedWidgets) });
    } catch (error) {
      console.error('[useDashboard] Failed to delete widget:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete widget';
      safeSetState({ error: errorMessage });
      throw error;
    }
  }, [safeSetState]);

  /**
   * Reorder widgets
   */
  const reorder = useCallback(async (widgetIds: string[]) => {
    try {
      safeSetState({ error: null });
      await apiReorderWidgets(widgetIds);

      // Re-fetch widgets to ensure we have the latest state
      const updatedWidgets = await listWidgets();
      safeSetState({ widgets: normalizeWidgets(updatedWidgets) });
    } catch (error) {
      console.error('[useDashboard] Failed to reorder widgets:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder widgets';
      safeSetState({ error: errorMessage });
      throw error;
    }
  }, [safeSetState]);

  /**
   * Toggle legend key visibility
   */
  const toggleLegend = useCallback(async (widgetId: string, legendKey: string) => {
    try {
      safeSetState({ error: null });

      // Find the widget
      const widget = state.widgets.find(w => w.id === widgetId);
      if (!widget) {
        throw new Error('Widget not found');
      }

      // Toggle the legend key
      const currentLegendKeys = normalizeLegendVisibility(widget.legendVisibility);
      const newLegendKeys = {
        ...currentLegendKeys,
        [legendKey]: !currentLegendKeys[legendKey],
      };

      // Update the widget
      await apiUpdateWidget(widgetId, {
        legendVisibility: newLegendKeys,
      });

      // Re-fetch widgets to ensure we have the latest state
      const updatedWidgets = await listWidgets();
      safeSetState({ widgets: normalizeWidgets(updatedWidgets) });
    } catch (error) {
      console.error('[useDashboard] Failed to toggle legend:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle legend';
      safeSetState({ error: errorMessage });
      throw error;
    }
  }, [state.widgets, safeSetState]);

  /**
   * Refresh all dashboard data
   */
  const refreshData = useCallback(async () => {
    await fetchInitialData();
  }, [fetchInitialData]);

  /**
   * Refresh data for a specific widget
   */
  const refreshWidgetData = useCallback(async (widgetId: string) => {
    try {
      safeSetState({ error: null });
      // This will fetch fresh data from the API
      // The actual data is not stored in this hook - widgets just track metadata
      // The component using this hook should call getWidgetData(widgetId) separately
      await getWidgetData(widgetId);
    } catch (error) {
      console.error('[useDashboard] Failed to refresh widget data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh widget data';
      safeSetState({ error: errorMessage });
      throw error;
    }
  }, [safeSetState]);

  return {
    ...state,
    actions: {
      create,
      rename,
      update,
      delete: deleteWidget,
      reorder,
      toggleLegend,
      refreshData,
      refreshWidgetData,
    },
  };
}

// Export for convenience
export default useDashboard;
