import type { AlertLevel } from '@/lib/types';

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  return `il y a ${days} j`;
}

export function age(birth: string | null): number | null {
  if (!birth) return null;
  const d = new Date(birth);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

export const difficultyLabels = ['', 'Très légère', 'Légère', 'Modérée', 'Difficile', 'Très difficile'];

export function difficultyLabel(level: number): string {
  return difficultyLabels[level] ?? 'Modérée';
}

export function fragilityBand(level: number): { label: string; tone: 'low' | 'mid' | 'high' } {
  if (level >= 70) return { label: 'Fragilité élevée', tone: 'high' };
  if (level >= 40) return { label: 'Fragilité modérée', tone: 'mid' };
  return { label: 'Fragilité faible', tone: 'low' };
}

export const alertMeta: Record<AlertLevel, { label: string; dot: string; text: string; bg: string; border: string }> = {
  critique: {
    label: 'Alerte critique',
    dot: 'bg-danger-500',
    text: 'text-danger-700 dark:text-danger-100',
    bg: 'bg-danger-50 dark:bg-danger-700/20',
    border: 'border-danger-500',
  },
  attention: {
    label: 'À surveiller',
    dot: 'bg-warn-500',
    text: 'text-warn-700 dark:text-warn-100',
    bg: 'bg-warn-50 dark:bg-warn-600/20',
    border: 'border-warn-500',
  },
  info: {
    label: 'Information',
    dot: 'bg-info-500',
    text: 'text-info-700 dark:text-info-100',
    bg: 'bg-info-50 dark:bg-info-600/20',
    border: 'border-info-500',
  },
};
