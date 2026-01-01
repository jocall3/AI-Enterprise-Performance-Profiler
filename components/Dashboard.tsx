
import React from 'react';
import { WebVitalsReport, MemorySnapshot, CPUSample } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  status: 'good' | 'needs-improvement' | 'poor';
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, subValue, status }) => {
  const colors = {
    good: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    'needs-improvement': 'text-amber-600 bg-amber-50 border-amber-100',
    poor: 'text-rose-600 bg-rose-50 border-rose-100'
  };

  return (
    <div className={`p-4 border rounded-2xl ${colors[status]} shadow-sm`}>
      <p className="text-sm font-medium opacity-80 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {subValue && <p className="text-xs mt-1 font-medium">{subValue}</p>}
    </div>
  );
};

export const VitalsGrid: React.FC<{ vitals: WebVitalsReport | null }> = ({ vitals }) => {
  if (!vitals) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <MetricCard label="LCP" value={`${vitals.lcp.toFixed(0)}ms`} status={vitals.lcp < 2500 ? 'good' : 'poor'} subValue="Largest Paint" />
      <MetricCard label="FID" value={`${vitals.fid.toFixed(0)}ms`} status={vitals.fid < 100 ? 'good' : 'poor'} subValue="First Interaction" />
      <MetricCard label="CLS" value={vitals.cls.toFixed(3)} status={vitals.cls < 0.1 ? 'good' : 'poor'} subValue="Layout Shift" />
      <MetricCard label="TTFB" value={`${vitals.ttfb.toFixed(0)}ms`} status={vitals.ttfb < 200 ? 'good' : 'poor'} subValue="Server Response" />
      <MetricCard label="FCP" value={`${vitals.fcp.toFixed(0)}ms`} status={vitals.fcp < 1800 ? 'good' : 'poor'} subValue="Content Paint" />
      <MetricCard label="TBT" value={`${vitals.tbt.toFixed(0)}ms`} status={vitals.tbt < 200 ? 'good' : 'poor'} subValue="Total Blocking" />
    </div>
  );
};

export const MemoryChart: React.FC<{ data: MemorySnapshot[] }> = ({ data }) => {
  const chartData = data.map(d => ({ ...d, usedMB: (d.used / 1024 / 1024).toFixed(1) }));
  return (
    <div className="h-64 w-full bg-white p-4 border rounded-2xl shadow-sm">
      <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Heap Usage (MB)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="timestamp" hide />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="usedMB" stroke="#6366f1" fill="#818cf8" fillOpacity={0.1} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CPUChart: React.FC<{ data: CPUSample[] }> = ({ data }) => {
  return (
    <div className="h-64 w-full bg-white p-4 border rounded-2xl shadow-sm">
      <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Main Thread Load (%)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="timestamp" hide />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="usage" stroke="#f43f5e" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
