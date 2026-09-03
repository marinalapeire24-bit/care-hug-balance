import { useState } from 'react';
import { Play, Sparkles, TrendingUp } from 'lucide-react';
import { simulateNewClients } from '@/lib/organization';

export default function Simulation() {
  const [count, setCount] = useState(3);
  const [result, setResult] = useState<ReturnType<typeof simulateNewClients> | null>(null);

  function run() {
    setResult(simulateNewClients(count));
  }

  const levelColors = {
    good: { bg: 'bg-brand-50 dark:bg-brand-700/20', text: 'text-brand-700 dark:text-brand-200', label: 'Acceptable', emoji: '🟢' },
    watch: { bg: 'bg-warn-50 dark:bg-warn-600/20', text: 'text-warn-700 dark:text-warn-100', label: 'Vigilance', emoji: '🟠' },
    risk: { bg: 'bg-danger-50 dark:bg-danger-700/20', text: 'text-danger-700 dark:text-danger-100', label: 'Risque important', emoji: '🔴' },
  };

  return (
    <div className="px-4 pt-5 pb-6 space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white flex items-center gap-2">
          <Sparkles size={26} className="text-brand-500" /> Simuler
        </h1>
        <p className="text-ink-500 dark:text-ink-300 text-sm mt-0.5">
          Testez l'impact d'une décision sur votre organisation
        </p>
      </div>

      {/* Scenario selector */}
      <div className="rounded-3xl bg-white dark:bg-ink-800 p-5 border border-ink-100 dark:border-ink-700">
        <h2 className="font-semibold text-ink-900 dark:text-white mb-1">Accepter de nouveaux clients</h2>
        <p className="text-sm text-ink-500 dark:text-ink-400 mb-4">Simulez l'impact de l'intégration de nouveaux bénéficiaires sur votre capacité.</p>

        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setCount(Math.max(1, count - 1))}
            className="w-10 h-10 rounded-full bg-ink-100 dark:bg-ink-900 text-ink-600 dark:text-ink-300 font-bold text-lg tap"
          >−</button>
          <span className="text-3xl font-bold text-ink-900 dark:text-white w-12 text-center">{count}</span>
          <button
            onClick={() => setCount(Math.min(10, count + 1))}
            className="w-10 h-10 rounded-full bg-ink-100 dark:bg-ink-900 text-ink-600 dark:text-ink-300 font-bold text-lg tap"
          >+</button>
          <span className="text-sm text-ink-500 dark:text-ink-300 ml-2">nouveau{count > 1 ? 'x' : ''} client{count > 1 ? 's' : ''}</span>
        </div>

        <button
          onClick={run}
          className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center justify-center gap-2 tap"
        >
          <Play size={18} /> Simuler
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-3xl p-5 border border-ink-100 dark:border-ink-700 ${levelColors[result.level].bg}`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{levelColors[result.level].emoji}</span>
            <span className={`text-xl font-bold ${levelColors[result.level].text}`}>{levelColors[result.level].label}</span>
          </div>
          <p className={`text-sm mb-4 ${levelColors[result.level].text}`}>{result.summary}</p>

          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-ink-500 dark:text-ink-400">Capacité utilisée</span>
              <span className="font-bold text-ink-900 dark:text-white">{result.capacity_percent}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-ink-100 dark:bg-ink-700 overflow-hidden">
              <div
                className={`h-full rounded-full ${result.level === 'risk' ? 'bg-danger-500' : result.level === 'watch' ? 'bg-warn-500' : 'bg-brand-500'}`}
                style={{ width: `${result.capacity_percent}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            {result.details.map((d, i) => (
              <div key={i} className={`text-sm flex items-start gap-2 ${levelColors[result.level].text}`}>
                <span className="mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" /> {d}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-ink-50 dark:bg-ink-900 p-4">
        <p className="text-xs text-ink-400 flex items-start gap-2">
          <TrendingUp size={14} className="shrink-0 mt-0.5" />
          La simulation est une estimation basée sur la charge actuelle de l'équipe et des données fictives. Elle ne prend pas en compte les compétences spécifiques requises ni la répartition géographique réelle.
        </p>
      </div>
    </div>
  );
}
