import React, { useState, useMemo, useEffect } from 'react';
import { Search, Grid, List, ChartLine, FileText, CheckCircle, Loader2, FlaskConical, Archive, Eye, Star, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, ProjectStatus, ProjectCategory } from '../types';
import { cn } from '../lib/utils';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid
} from 'recharts';

const STATUS_META: Record<ProjectStatus, { color: string; bg: string; icon: any; pulse?: boolean }> = {
  'Shipped': { color: '#00FF88', bg: 'rgba(0,255,136,0.1)', icon: CheckCircle },
  'In Progress': { color: '#FFB800', bg: 'rgba(255,184,0,0.1)', icon: Loader2, pulse: true },
  'Experiment': { color: '#FF6B35', bg: 'rgba(255,107,53,0.1)', icon: FlaskConical },
  'Archived': { color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)', icon: Archive }
};

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(setProjects);
  }, []);

  const filteredProjects = useMemo(() => {
    let result = [...projects];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.stack.some(s => s.toLowerCase().includes(q))
      );
    }
    if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter);
    if (categoryFilter !== 'all') result = result.filter(p => p.category === categoryFilter);

    const [field, dir] = sortBy.split('-');
    result.sort((a, b) => {
      let va: number | string, vb: number | string;
      switch (field) {
        case 'date': va = new Date(a.startDate).getTime(); vb = new Date(b.startDate).getTime(); break;
        case 'name': va = a.name.toLowerCase(); vb = b.name.toLowerCase(); break;
        case 'visitors': va = a.visitors; vb = b.visitors; break;
        case 'stars': va = a.stars; vb = b.stars; break;
        default: va = new Date(a.startDate).getTime(); vb = new Date(b.startDate).getTime();
      }
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [projects, search, statusFilter, categoryFilter, sortBy]);

  const statsData = useMemo(() => {
    const statusCounts = projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    const stackMap = projects.reduce((acc, p) => {
      p.stack.forEach(s => { acc[s] = (acc[s] || 0) + 1; });
      return acc;
    }, {} as Record<string, number>);

    const barData = (Object.entries(stackMap) as [string, number][])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));

    const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const activityData = months.map((month, i) => ({
      name: month,
      value: [1, 0, 1, 1, 1, 1, 1, 2, 1, 2, 1][i] || 0
    }));

    const visitorTrendData = months.map((month, i) => ({
      name: month,
      value: [0, 0, 6700, 22100, 8900, 15600, 12400, 3100, 27300, 14200, 7000][i] || 0
    }));

    return { pieData, barData, activityData, visitorTrendData };
  }, [projects]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-2">Overview</h1>
        <p className="text-muted text-sm font-mono">
          Tracking <span className="text-ink font-semibold">{projects.length} projects</span> across <span className="text-ink font-semibold">5 months</span> of building in public.
        </p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border-s rounded-xl p-4 h-48">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">By Status</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statsData.pieData}
                innerRadius={40}
                outerRadius={60}
                paddingAngle={5}
                dataKey="value"
              >
                {statsData.pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_META[entry.name as ProjectStatus]?.color || '#9CA3AF'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border-s rounded-xl p-4 h-48">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">Tech Stack</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statsData.barData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, family: 'JetBrains Mono' }} />
              <Tooltip />
              <Bar dataKey="value" fill="#1A1A1A" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Placeholder for other charts */}
        <div className="bg-card border border-border-s rounded-xl p-4 h-48">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">Monthly Activity</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statsData.activityData}>
              <XAxis dataKey="name" tick={{ fontSize: 8, family: 'JetBrains Mono' }} />
              <Tooltip />
              <Bar dataKey="value" fill="#1A1A1A" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border-s rounded-xl p-4 h-48">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">Visitor Trend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={statsData.visitorTrendData}>
              <XAxis dataKey="name" tick={{ fontSize: 8, family: 'JetBrains Mono' }} />
              <YAxis tick={{ fontSize: 8, family: 'JetBrains Mono' }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#00FF88" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2.5 items-center">
        <div className="relative flex-1 min-w-[180px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects, stack..."
            className="w-full pl-9 pr-4 py-2 bg-card border border-border-s rounded-lg text-xs focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon/30 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-card border border-border-s rounded-lg text-xs text-ink focus:outline-none focus:border-neon transition-colors cursor-pointer appearance-none"
        >
          <option value="all">All Status</option>
          <option value="Shipped">Shipped</option>
          <option value="In Progress">In Progress</option>
          <option value="Experiment">Experiment</option>
          <option value="Archived">Archived</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-card border border-border-s rounded-lg text-xs text-ink focus:outline-none focus:border-neon transition-colors cursor-pointer appearance-none"
        >
          <option value="all">All Categories</option>
          <option value="Tool">Tool</option>
          <option value="Library">Library</option>
          <option value="App">App</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 bg-card border border-border-s rounded-lg text-xs text-ink focus:outline-none focus:border-neon transition-colors cursor-pointer appearance-none"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="visitors-desc">Most Visitors</option>
          <option value="stars-desc">Most Stars</option>
        </select>
        <div className="flex border border-border-s rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('cards')}
            className={cn("px-3 py-2 text-xs font-medium transition-colors", viewMode === 'cards' ? "bg-ink text-neon" : "text-muted hover:text-ink")}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={cn("px-3 py-2 text-xs font-medium transition-colors", viewMode === 'table' ? "bg-ink text-neon" : "text-muted hover:text-ink")}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => setIsMetricsOpen(true)}
          className="px-3 py-2 text-xs font-medium text-muted border border-border-s rounded-lg hover:border-neon hover:text-neon transition-colors flex items-center gap-1.5"
        >
          <ChartLine className="w-3.5 h-3.5" /> Metrics
        </button>
        <button
          onClick={() => setIsReportOpen(true)}
          className="px-3 py-2 text-xs font-medium text-muted border border-border-s rounded-lg hover:border-neon hover:text-neon transition-colors flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" /> Report
        </button>
      </div>

      {/* Projects Grid/Table */}
      <AnimatePresence mode="wait">
        {viewMode === 'cards' ? (
          <motion.div
            key="cards"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredProjects.map((p) => (
              <ProjectCard key={p.id} project={p} onClick={() => setSelectedProject(p)} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card border border-border-s rounded-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-border-s text-left text-[10px] uppercase tracking-widest text-muted">
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Status</th>
                    <th className="px-4 py-3 hidden md:table-cell">Category</th>
                    <th className="px-4 py-3 text-right">Visitors</th>
                    <th className="px-4 py-3 text-right">Stars</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-border-s/50 hover:bg-neon/5 cursor-pointer transition-colors"
                      onClick={() => setSelectedProject(p)}
                    >
                      <td className="px-4 py-3 font-heading font-semibold text-sm">{p.name}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted">{p.category}</td>
                      <td className="px-4 py-3 text-right">{p.visitors.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{p.stars.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}

      {/* Metrics Panel */}
      <AnimatePresence>
        {isMetricsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMetricsOpen(false)}
              className="fixed inset-0 z-[70] bg-ink/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-[75] w-full max-w-md bg-surface border-l border-border-s overflow-y-auto shadow-2xl"
            >
              <MetricsPanel projects={projects} onClose={() => setIsMetricsOpen(false)} onProjectClick={(p) => { setIsMetricsOpen(false); setSelectedProject(p); }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {isReportOpen && (
          <ReportModal projects={projects} onClose={() => setIsReportOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricsPanel({ projects, onClose, onProjectClick }: { projects: Project[], onClose: () => void, onProjectClick: (p: Project) => void }) {
  const totalVisitors = projects.reduce((s, p) => s + p.visitors, 0);
  const totalStars = projects.reduce((s, p) => s + p.stars, 0);
  const shipped = projects.filter(p => p.status === 'Shipped').length;
  const inProgress = projects.filter(p => p.status === 'In Progress').length;
  const experiments = projects.filter(p => p.status === 'Experiment').length;
  const archived = projects.filter(p => p.status === 'Archived').length;

  const visitorTrendData = [
    { name: 'Aug', value: 4200 },
    { name: 'Sep', value: 8900 },
    { name: 'Oct', value: 15300 },
    { name: 'Nov', value: 28700 },
    { name: 'Dec', value: 75800 },
  ];

  const starGrowthData = [
    { name: 'Aug', value: 0 },
    { name: 'Sep', value: 567 },
    { name: 'Oct', value: 891 },
    { name: 'Nov', value: 1203 },
    { name: 'Dec', value: 3595 },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-heading text-xl font-bold">Open Metrics</h2>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-muted hover:text-ink transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-card border border-border-s rounded-xl p-4">
          <div className="text-2xl font-heading font-bold text-neon">{totalVisitors.toLocaleString()}</div>
          <div className="text-[10px] font-mono text-muted mt-1">Total Visitors</div>
        </div>
        <div className="bg-card border border-border-s rounded-xl p-4">
          <div className="text-2xl font-heading font-bold">{totalStars.toLocaleString()}</div>
          <div className="text-[10px] font-mono text-muted mt-1">Total Stars</div>
        </div>
        <div className="bg-card border border-border-s rounded-xl p-4">
          <div className="text-2xl font-heading font-bold text-shipped">{shipped}</div>
          <div className="text-[10px] font-mono text-muted mt-1">Shipped</div>
        </div>
        <div className="bg-card border border-border-s rounded-xl p-4">
          <div className="text-2xl font-heading font-bold text-progress">{inProgress}</div>
          <div className="text-[10px] font-mono text-muted mt-1">In Progress</div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">Status Breakdown</h3>
        <div className="space-y-3">
          {[
            { label: 'Shipped', count: shipped, color: '#00FF88' },
            { label: 'In Progress', count: inProgress, color: '#FFB800' },
            { label: 'Experiment', count: experiments, color: '#FF6B35' },
            { label: 'Archived', count: archived, color: '#9CA3AF' }
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="w-20 text-[10px] font-mono text-muted">{s.label}</div>
              <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(s.count / Math.max(1, projects.length)) * 100}%` }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: s.color }}
                />
              </div>
              <div className="w-6 text-[10px] font-mono font-semibold text-right">{s.count}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">Top Projects by Visitors</h3>
        <div className="space-y-3">
          {[...projects].sort((a, b) => b.visitors - a.visitors).slice(0, 5).map(p => (
            <div key={p.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => onProjectClick(p)}>
              <div className="w-24 text-[10px] font-mono text-ink truncate font-medium group-hover:text-neon transition-colors">{p.name}</div>
              <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                <div className="h-full bg-ink/10 rounded-full" style={{ width: `${(p.visitors / Math.max(1, ...projects.map(x => x.visitors))) * 100}%` }} />
              </div>
              <div className="w-12 text-[10px] font-mono text-muted text-right">{p.visitors.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">Visitor Trend</h3>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visitorTrendData}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#00FF88" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">Star Growth</h3>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={starGrowthData}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="value" fill="#1A1A1A" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="text-center pt-4 border-t border-border-s">
        <p className="text-[10px] font-mono text-muted">Data updated Dec 15, 2024. All metrics are public.</p>
      </div>
    </div>
  );
}

function ReportModal({ projects, onClose }: { projects: Project[], onClose: () => void }) {
  const total = projects.length;
  const shipped = projects.filter(p => p.status === 'Shipped').length;
  const inProgress = projects.filter(p => p.status === 'In Progress').length;
  const experiments = projects.filter(p => p.status === 'Experiment').length;
  const archived = projects.filter(p => p.status === 'Archived').length;
  const totalVisitors = projects.reduce((s, p) => s + p.visitors, 0);
  const totalStars = projects.reduce((s, p) => s + p.stars, 0);

  const stackMap = projects.reduce((acc, p) => {
    p.stack.forEach(s => { acc[s] = (acc[s] || 0) + 1; });
    return acc;
  }, {} as Record<string, number>);
  const topStack = Object.entries(stackMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const shippedProjects = projects.filter(p => p.shipDate);
  const avgDays = shippedProjects.length > 0 ? Math.round(shippedProjects.reduce((s, p) => s + (new Date(p.shipDate!).getTime() - new Date(p.startDate).getTime()) / 86400000, 0) / shippedProjects.length) : 0;

  const fastest = [...shippedProjects].sort((a, b) => (new Date(a.shipDate!).getTime() - new Date(a.startDate).getTime()) - (new Date(b.shipDate!).getTime() - new Date(b.startDate).getTime()))[0];
  const fastestDays = fastest ? Math.round((new Date(fastest.shipDate!).getTime() - new Date(fastest.startDate).getTime()) / 86400000) : 0;

  const mostPopular = [...projects].sort((a, b) => b.visitors - a.visitors)[0];
  const mostStarred = [...projects].sort((a, b) => b.stars - a.stars)[0];

  const reportText = `BUILD LOG — PROJECT REPORT
Generated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
Period: Feb 2024 – Dec 2024

SUMMARY
Total Projects: ${total}
Shipped: ${shipped} (${Math.round(shipped / Math.max(1, total) * 100)}%)
In Progress: ${inProgress} (${Math.round(inProgress / Math.max(1, total) * 100)}%)
Experiment: ${experiments} (${Math.round(experiments / Math.max(1, total) * 100)}%)
Archived: ${archived} (${Math.round(archived / Math.max(1, total) * 100)}%)

KEY METRICS
Total Visitors: ${totalVisitors.toLocaleString()}
Total Stars: ${totalStars.toLocaleString()}
Avg Time to Ship: ${avgDays} days

TOP TECH STACK
 ${topStack.map(([name, count]) => `${name} — ${count} projects`).join('\n')}

HIGHLIGHTS
Most Popular: ${mostPopular?.name} (${mostPopular?.visitors.toLocaleString()} visitors)
Most Starred: ${mostStarred?.name} (${mostStarred?.stars.toLocaleString()} stars)
Fastest Ship: ${fastest?.name} (${fastestDays} days)`;

  const copyReport = () => {
    navigator.clipboard.writeText(reportText);
    // In a real app we'd show a toast here
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-surface rounded-2xl border border-border-s w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl p-6 sm:p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl font-bold">Project Report</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-muted hover:text-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-[10px] font-mono text-muted mb-4">Period: Feb 2024 – Dec 2024</div>

        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="bg-card border border-border-s rounded-lg p-3 text-center">
            <div className="text-xl font-heading font-bold">{total}</div>
            <div className="text-[9px] font-mono text-muted">Total</div>
          </div>
          <div className="bg-card border border-border-s rounded-lg p-3 text-center">
            <div className="text-xl font-heading font-bold text-shipped">{shipped}</div>
            <div className="text-[9px] font-mono text-muted">Shipped</div>
          </div>
          <div className="bg-card border border-border-s rounded-lg p-3 text-center">
            <div className="text-xl font-heading font-bold text-progress">{inProgress}</div>
            <div className="text-[9px] font-mono text-muted">Active</div>
          </div>
          <div className="bg-card border border-border-s rounded-lg p-3 text-center">
            <div className="text-xl font-heading font-bold">{avgDays}</div>
            <div className="text-[9px] font-mono text-muted">Avg Days</div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Key Metrics</h4>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between border-b border-border-s/50 pb-1">
              <span className="text-muted">Total Visitors</span>
              <span className="font-semibold">{totalVisitors.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-border-s/50 pb-1">
              <span className="text-muted">Total Stars</span>
              <span className="font-semibold">{totalStars.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-border-s/50 pb-1">
              <span className="text-muted">Avg Time to Ship</span>
              <span className="font-semibold">{avgDays} days</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Top Tech Stack</h4>
          <div className="space-y-2">
            {topStack.map(([name, count]) => (
              <div key={name} className="flex items-center gap-2 text-xs font-mono">
                <span className="w-28 text-muted truncate">{name}</span>
                <div className="flex-1 h-1.5 bg-card border border-border-s rounded-full overflow-hidden">
                  <div className="h-full bg-ink/20 rounded-full" style={{ width: `${(count / Math.max(1, topStack[0][1])) * 100}%` }} />
                </div>
                <span className="w-8 text-right font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Highlights</h4>
          <div className="space-y-3 text-xs">
            <div className="flex gap-2">
              <span className="text-neon flex-shrink-0 mt-1"><CheckCircle className="w-3 h-3" /></span>
              <span className="text-muted">Most popular: <strong className="text-ink">{mostPopular?.name}</strong> with {mostPopular?.visitors.toLocaleString()} visitors</span>
            </div>
            <div className="flex gap-2">
              <span className="text-neon flex-shrink-0 mt-1"><CheckCircle className="w-3 h-3" /></span>
              <span className="text-muted">Most starred: <strong className="text-ink">{mostStarred?.name}</strong> with {mostStarred?.stars.toLocaleString()} stars</span>
            </div>
            <div className="flex gap-2">
              <span className="text-neon flex-shrink-0 mt-1"><CheckCircle className="w-3 h-3" /></span>
              <span className="text-muted">Fastest ship: <strong className="text-ink">{fastest?.name}</strong> in {fastestDays} days</span>
            </div>
          </div>
        </div>

        <button
          onClick={copyReport}
          className="w-full py-3 bg-ink text-neon font-heading font-semibold text-sm rounded-lg hover:bg-ink/90 transition-colors neon-glow flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" /> Copy as Text
        </button>
      </motion.div>
    </div>
  );
}

const ProjectCard: React.FC<{ project: Project; onClick: () => void }> = ({ project, onClick }) => {
  return (
    <div
      className="bg-card border border-border-s rounded-xl overflow-hidden hover:translate-y-[-4px] hover:shadow-lg transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative h-40 overflow-hidden bg-ink/5">
        <img
          src={project.screenshot}
          alt={project.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3">
          <StatusBadge status={project.status} />
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-ink/70 text-white">
            {project.category}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-heading font-bold text-base mb-1">{project.name}</h3>
        <p className="text-muted text-xs leading-relaxed mb-3 line-clamp-2">{project.tagline}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {project.stack.slice(0, 3).map((s) => (
            <span key={s} className="px-1.5 py-0.5 bg-surface rounded text-[10px] font-mono text-muted">
              {s}
            </span>
          ))}
          {project.stack.length > 3 && (
            <span className="px-1.5 py-0.5 bg-surface rounded text-[10px] font-mono text-muted">
              +{project.stack.length - 3}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-muted">
          <span>{project.shipDate ? 'Shipped' : 'Active'}</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {project.visitors.toLocaleString()}</span>
            <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {project.stars.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold"
      style={{ backgroundColor: meta.bg, color: meta.color }}
    >
      <Icon className={cn("w-2.5 h-2.5", meta.pulse && "animate-pulse")} />
      {status}
    </span>
  );
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const meta = STATUS_META[project.status];
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-surface rounded-2xl border border-border-s w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="relative h-52 sm:h-64 overflow-hidden bg-ink/5">
          <img
            src={project.screenshot}
            alt={project.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-ink/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-ink/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <StatusBadge status={project.status} />
            <span className="px-2.5 py-1 bg-card border border-border-s rounded-md text-[11px] font-mono font-medium text-muted">
              {project.category}
            </span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-2">{project.name}</h2>
          <p className="text-muted text-sm leading-relaxed mb-4">{project.tagline}</p>
          <div className="flex flex-wrap gap-1.5 mb-6">
            {project.stack.map((s) => (
              <span key={s} className="px-2 py-0.5 border border-border-s rounded-md text-[10px] font-mono text-muted">
                {s}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="bg-card border border-border-s rounded-lg p-3 text-center">
              <div className="text-lg font-heading font-bold">{project.visitors.toLocaleString()}</div>
              <div className="text-[10px] font-mono text-muted">Visitors</div>
            </div>
            <div className="bg-card border border-border-s rounded-lg p-3 text-center">
              <div className="text-lg font-heading font-bold">{project.stars.toLocaleString()}</div>
              <div className="text-[10px] font-mono text-muted">Stars</div>
            </div>
            <div className="bg-card border border-border-s rounded-lg p-3 text-center">
              <div className="text-lg font-heading font-bold">{new Date(project.startDate).toLocaleDateString()}</div>
              <div className="text-[10px] font-mono text-muted">Started</div>
            </div>
            <div className="bg-card border border-border-s rounded-lg p-3 text-center">
              <div className="text-lg font-heading font-bold">{project.shipDate ? new Date(project.shipDate).toLocaleDateString() : 'Active'}</div>
              <div className="text-[10px] font-mono text-muted">Status</div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Description</h4>
              <p className="text-sm leading-relaxed text-ink/80">{project.description}</p>
            </div>

            {project.lessons && (
              <div>
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">Lessons Learned</h4>
                <ul className="space-y-2">
                  {project.lessons.map((lesson, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="text-neon mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-neon" />
                      <span className="text-muted leading-relaxed">{lesson}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-border-s flex gap-3">
            <button className="flex-1 py-2.5 bg-ink text-neon font-heading font-semibold text-sm rounded-lg hover:bg-ink/90 transition-colors neon-glow flex items-center justify-center gap-2">
              <Github className="w-4 h-4" /> View Source
            </button>
            <button className="flex-1 py-2.5 border border-border-s text-ink font-heading font-medium text-sm rounded-lg hover:border-neon hover:text-neon transition-colors">
              Live Demo
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
}
