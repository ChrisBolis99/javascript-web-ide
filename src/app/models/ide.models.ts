export type ConsoleLevel = 'log' | 'warn' | 'error';

export interface ConsoleEntry {
  id: number;
  level: ConsoleLevel;
  message: string;
  time: string;
}