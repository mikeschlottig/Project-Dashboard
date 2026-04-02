export type ProjectStatus = 'Shipped' | 'In Progress' | 'Experiment' | 'Archived';
export type ProjectCategory = 'Tool' | 'Library' | 'App';

export interface Change {
  type: 'added' | 'fixed' | 'changed' | 'removed';
  text: string;
}

export interface WeeklyUpdate {
  week: string;
  projectId: number;
  projectName: string;
  changes: Change[];
  dateRange?: string;
}

export interface Project {
  id: number;
  name: string;
  tagline: string;
  description: string;
  status: ProjectStatus;
  category: ProjectCategory;
  stack: string[];
  startDate: string;
  shipDate: string | null;
  screenshot: string;
  visitors: number;
  stars: number;
  lessons?: string[];
  updates?: { week: string; changes: Change[] }[];
}

export interface TimelineEntry {
  date: string;
  type: 'shipped' | 'update' | 'milestone' | 'started' | 'archived';
  title: string;
  description: string;
  projectId: number;
}
