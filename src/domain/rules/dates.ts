import { addDays as addDaysFn, differenceInCalendarDays, format, parseISO, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";

import type { ISODate } from "@/domain/models";

/** Calendar dates are handled as local "YYYY-MM-DD" strings (no time zone shifts). */
export function toISODate(date: Date): ISODate {
  return format(date, "yyyy-MM-dd");
}

export function todayISO(): ISODate {
  return toISODate(new Date());
}

export function addDays(date: ISODate, days: number): ISODate {
  return toISODate(addDaysFn(parseISO(date), days));
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function daysBetween(from: ISODate, to: ISODate): number {
  return differenceInCalendarDays(parseISO(to), parseISO(from));
}

export function mondayOf(date: ISODate): ISODate {
  return toISODate(startOfWeek(parseISO(date), { weekStartsOn: 1 }));
}

export function isValidISODate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parseISO(value).getTime());
}

/** "lun. 3 nov." style labels for compact UI. */
export function formatShortDate(date: ISODate): string {
  return format(parseISO(date), "EEE d MMM", { locale: es });
}

/** "3 de noviembre de 2026". */
export function formatLongDate(date: ISODate): string {
  return format(parseISO(date), "d 'de' MMMM 'de' yyyy", { locale: es });
}

export function formatRange(start: ISODate, end: ISODate): string {
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  const startLabel = format(parseISO(start), sameYear ? "d MMM" : "d MMM yyyy", { locale: es });
  const endLabel = format(parseISO(end), "d MMM yyyy", { locale: es });
  return `${startLabel} – ${endLabel}`;
}
