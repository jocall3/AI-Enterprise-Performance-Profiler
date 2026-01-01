
export interface TraceEntry {
  name: string;
  startTime: number;
  duration: number;
  entryType: 'measure' | 'mark' | 'longtask' | 'script';
  category?: string;
  args?: Record<string, any>;
  children?: TraceEntry[];
}

export interface WebVitalsReport {
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  fcp: number;
  tbt: number;
  timestamp: number;
}

export interface MemorySnapshot {
  timestamp: number;
  used: number;
  total: number;
  limit: number;
}

export interface CPUSample {
  timestamp: number;
  usage: number;
}

export interface AIRecommendation {
  id: string;
  category: 'code' | 'infrastructure' | 'bundle';
  priority: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  suggestedFix?: string;
}

export type TabId = 'runtime' | 'bundle' | 'ai' | 'comparison' | 'settings' | 'integrations';
