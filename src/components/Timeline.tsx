import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { TimelineEntry } from '../types';
import { Rocket, Pen, Trophy, Play, Archive } from 'lucide-react';
import { cn } from '../lib/utils';

const TYPE_META = {
  shipped: { color: '#00FF88', icon: Rocket, label: 'Shipped' },
  update: { color: '#FFB800', icon: Pen, label: 'Update' },
  milestone: { color: '#6366F1', icon: Trophy, label: 'Milestone' },
  started: { color: '#3B82F6', icon: Play, label: 'Started' },
  archived: { color: '#9CA3AF', icon: Archive, label: 'Archived' }
};

export default function Timeline() {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);

  useEffect(() => {
    fetch('/api/timeline')
      .then(res => res.json())
      .then(setEntries);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-2">Timeline</h1>
        <p className="text-muted text-sm font-mono">A chronological record of ships, updates, and pivots.</p>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-[14px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-border-s to-transparent" />

        <div className="space-y-12">
          {entries.map((entry, i) => {
            const meta = TYPE_META[entry.type];
            const Icon = meta.icon;
            const isLeft = i % 2 === 0;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative flex items-start"
              >
                {/* Dot */}
                <div
                  className="absolute left-[10px] md:left-1/2 md:-translate-x-1/2 w-3 h-3 rounded-full border-2 z-10 bg-surface"
                  style={{ borderColor: meta.color }}
                />

                {/* Date Label (Desktop) */}
                <div className={cn(
                  "hidden md:block w-[calc(50%-30px)]",
                  isLeft ? "text-right pr-8" : "text-left pl-8 order-3"
                )}>
                  <span className="text-[10px] font-mono text-muted">
                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {/* Card */}
                <div className={cn(
                  "ml-10 md:ml-0 w-full md:w-[calc(50%-30px)]",
                  !isLeft && "md:order-2"
                )}>
                  <div className="bg-card border border-border-s rounded-xl p-5 hover:shadow-md transition-shadow cursor-default">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-3 h-3" style={{ color: meta.color }} />
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider" style={{ color: meta.color }}>
                        {meta.label}
                      </span>
                      <span className="text-[10px] font-mono text-muted md:hidden ml-auto">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-sm mb-1">{entry.title}</h3>
                    <p className="text-muted text-xs leading-relaxed">{entry.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
