import { AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';
import { forecasts, forecastLevelColors, organizationalProblems } from '@/lib/organization';

export default function Forecasts() {
  return (
    <div className="px-4 pt-5 pb-6 space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white flex items-center gap-2">
          <TrendingUp size={26} className="text-brand-500" /> Prévisions
        </h1>
        <p className="text-ink-500 dark:text-ink-300 text-sm mt-0.5">
          Anticipation des risques futurs sur l'organisation
        </p>
      </div>

      {/* Prévisions */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-ink-500 dark:text-ink-300 uppercase tracking-wide px-1">
          Risques anticipés
        </h2>
        {forecasts.map((f) => (
          <div key={f.id} className={`rounded-2xl border p-4 ${forecastLevelColors[f.level]}`}>
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <span className="font-bold text-sm">{f.title}</span>
            </div>
            <div className="text-xs opacity-80 mb-2">{f.period}</div>
            <div className="space-y-1.5 text-sm">
              <div><span className="font-semibold">Cause :</span> {f.cause}</div>
              <div><span className="font-semibold">Impact :</span> {f.impact}</div>
            </div>
            <div className="mt-3 rounded-xl bg-white/60 dark:bg-ink-900/40 p-3">
              <div className="text-xs font-semibold mb-1.5 flex items-center gap-1"><Lightbulb size={14} /> Solutions possibles</div>
              <ul className="space-y-1">
                {f.solutions.map((s, i) => (
                  <li key={i} className="text-xs flex items-start gap-1.5">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Problèmes récurrents détectés */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-ink-500 dark:text-ink-300 uppercase tracking-wide px-1">
          Problèmes récurrents détectés
        </h2>
        {organizationalProblems.map((op) => (
          <div key={op.id} className="rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 p-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="font-medium text-ink-900 dark:text-white text-sm">{op.title}</span>
              <span className="text-xs text-ink-400 whitespace-nowrap">{op.occurrences} occ.</span>
            </div>
            <p className="text-xs text-ink-600 dark:text-ink-300">{op.description}</p>
            <div className="mt-2 rounded-xl bg-warn-50 dark:bg-warn-600/10 px-3 py-2">
              <span className="text-xs font-semibold text-warn-600 dark:text-warn-300">Cause probable : </span>
              <span className="text-xs text-ink-600 dark:text-ink-300">{op.cause}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
