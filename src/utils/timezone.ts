export interface TimezoneOption {
  value: string;
  label: string;
  abbr: string;
  offset: string;
}

export const SUPPORTED_TIMEZONES: TimezoneOption[] = [
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)', abbr: 'IST', offset: '+05:30' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)', abbr: 'UTC', offset: '+00:00' },
  { value: 'Etc/GMT', label: 'Greenwich Mean Time (GMT)', abbr: 'GMT', offset: '+00:00' },
  { value: 'America/New_York', label: 'US Eastern Time (ET)', abbr: 'ET', offset: '-04:00' },
  { value: 'America/Los_Angeles', label: 'US Pacific Time (PT)', abbr: 'PT', offset: '-07:00' },
  { value: 'Europe/London', label: 'British Time (London)', abbr: 'BST', offset: '+01:00' },
  { value: 'Europe/Berlin', label: 'Central European Time (CET)', abbr: 'CET', offset: '+02:00' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)', abbr: 'JST', offset: '+09:00' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AEST)', abbr: 'AEST', offset: '+10:00' },
];

export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

export function formatContestDateTime(utcIso: string, timeZone: string = DEFAULT_TIMEZONE): string {
  try {
    const date = new Date(utcIso);
    if (isNaN(date.getTime())) return 'TBD';
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return new Date(utcIso).toLocaleString();
  }
}

export function formatContestDate(utcIso: string, timeZone: string = DEFAULT_TIMEZONE): string {
  try {
    const date = new Date(utcIso);
    if (isNaN(date.getTime())) return 'TBD';
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return new Date(utcIso).toLocaleDateString();
  }
}

export function formatContestTime(utcIso: string, timeZone: string = DEFAULT_TIMEZONE): string {
  try {
    const date = new Date(utcIso);
    if (isNaN(date.getTime())) return 'TBD';
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return new Date(utcIso).toLocaleTimeString();
  }
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remHours = hours % 24;
    return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

export function calculateContestStatus(startTimeIso: string, endTimeIso: string): 'upcoming' | 'live' | 'finished' {
  const now = Date.now();
  const start = new Date(startTimeIso).getTime();
  const end = new Date(endTimeIso).getTime();

  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'live';
  return 'finished';
}

export function getTimeRemaining(targetIso: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isPast: boolean;
} {
  const totalMs = new Date(targetIso).getTime() - Date.now();
  if (totalMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isPast: true };
  }

  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, totalSeconds, isPast: false };
}
