
import React, { useState } from 'react';
import { TraceEntry } from '../types';

interface FlameChartProps {
  data: TraceEntry[];
  onSelect: (entry: TraceEntry) => void;
}

export const FlameChart: React.FC<FlameChartProps> = ({ data, onSelect }) => {
  const [zoom, setZoom] = useState(1);
  
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-xl bg-slate-50">
        <p className="text-slate-400">No trace data recorded</p>
      </div>
    );
  }

  const maxTime = Math.max(...data.map(t => t.startTime + t.duration));
  const minTime = Math.min(...data.map(t => t.startTime));
  const totalDuration = maxTime - minTime;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center px-4">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Runtime Execution Flow</span>
        <div className="flex items-center gap-2">
           <button onClick={() => setZoom(Math.max(1, zoom - 0.5))} className="p-1 hover:bg-slate-200 rounded">Zoom Out</button>
           <button onClick={() => setZoom(zoom + 0.5)} className="p-1 hover:bg-slate-200 rounded">Zoom In</button>
        </div>
      </div>
      <div className="overflow-x-auto border rounded-xl bg-white shadow-sm p-4 h-96 custom-scrollbar">
        <div 
          className="relative min-w-full"
          style={{ width: `${zoom * 100}%`, height: '500px' }}
        >
          {data.map((entry, i) => {
            const left = ((entry.startTime - minTime) / totalDuration) * 100;
            const width = Math.max(0.1, (entry.duration / totalDuration) * 100);
            // Simple depth calculation for visualization
            const top = (i % 15) * 24; 
            
            return (
              <div
                key={i}
                onClick={() => onSelect(entry)}
                className="absolute h-5 rounded cursor-pointer transition-colors hover:ring-2 hover:ring-indigo-400 flex items-center px-1 overflow-hidden whitespace-nowrap text-[10px] text-white font-medium"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  top: `${top}px`,
                  backgroundColor: entry.duration > 50 ? '#ef4444' : '#6366f1'
                }}
                title={`${entry.name}: ${entry.duration.toFixed(2)}ms`}
              >
                {width > 2 && entry.name}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
