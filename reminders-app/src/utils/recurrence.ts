import type { Recurrence } from '../types';

export function nextOccurrence(dueAt: string, recurrence: Recurrence): string {
  const date = new Date(dueAt);
  switch (recurrence) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'none':
      break;
  }
  return date.toISOString();
}

export const recurrenceLabels: Record<Recurrence, string> = {
  none: 'ללא חזרה',
  daily: 'יומי',
  weekly: 'שבועי',
  monthly: 'חודשי',
};
