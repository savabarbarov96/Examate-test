/**
 * Shared types for statistics and dashboard services
 */

export interface DashboardWidget {
  id: string;
  userId: string;
  type: string;
  title: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config?: Record<string, any>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface StatisticData {
  label: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

export interface ChartDataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
}

export interface LoginAttempt {
  id: string;
  userId?: string;
  email: string;
  ipAddress: string;
  success: boolean;
  failureReason?: string;
  timestamp: Date | string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
  };
}
