import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { WeeklyUpdate } from '../types';
import { cn } from '../lib/utils';

export default function WeeklyUpdates() {
  const [updates, setUpdates] = useState<WeeklyUpdate[]>([]);

  useEffect(() => {
    fetch('/api/updates')
      .then(res => res.json())
      .then(setUpdates);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-2">Weekly Updates</h1>
        <p className="text-muted text-sm font-mono">Changelog-style entries for what shipped each week.</p>
      </div>

      <div className="space-y-8">
        {updates.map((update, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="space-y-3"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-semibold text-ink bg-card border border-border-s rounded-md px-2.5 py-1">
                {update.week}
              </span>
              <span className="text-muted text-xs font-mono">{update.dateRange}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-neon/10 text-neon">
                {update.projectName}
              </span>
            </div>
            <div className="bg-card border border-border-s rounded-xl p-5 pl-8 font-mono text-xs leading-loose space-y-1">
              {update.changes.map((change, j) => (
                <div key={j} className={cn(
                  change.type === 'added' && "text-green-600",
                  change.type === 'fixed' && "text-red-600",
                  change.type === 'changed' && "text-amber-600",
                  change.type === 'removed' && "text-gray-400"
                )}>
                  <span className="inline-block w-4 text-center mr-2 font-bold">
                    {change.type === 'added' ? '+' : change.type === 'fixed' ? '-' : change.type === 'changed' ? '~' : 'x'}
                  </span>
                  {change.text}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
