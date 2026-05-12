export type LogLevel = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'CRITICAL' | 'DEBUG';

export interface Log {
  id: string;
  service?: string;
  level?: LogLevel;
  message: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}
