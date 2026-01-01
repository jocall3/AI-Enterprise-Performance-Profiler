
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  TraceEntry, WebVitalsReport, MemorySnapshot, 
  CPUSample, AIRecommendation, TabId 
} from './types';
import { VitalsGrid, MemoryChart, CPUChart } from './components/Dashboard';
import { FlameChart } from './components/FlameChart';
import { analyzePerformanceWithAI } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('runtime');
  const [isRecording, setIsRecording] = useState(false);
  const [traceData, setTraceData] = useState<TraceEntry[]>([]);
  const [vitals, setVitals] = useState<WebVitalsReport | null>(null);
  const [memoryHistory, setMemoryHistory] = useState<MemorySnapshot[]>([]);
  const [cpuHistory, setCpuHistory] = useState<CPUSample[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TraceEntry | null>(null);

  // Mock initial vitals
  useEffect(() => {
    setVitals({
      lcp: Math.random() * 3000,
      fid: Math.random() * 150,
      cls: Math.random() * 0.2,
      ttfb: Math.random() * 300,
      fcp: Math.random() * 2000,
      tbt: Math.random() * 500,
      timestamp: Date.now()
    });
  }, []);

  // Periodic data sampling simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Sample memory
      setMemoryHistory(prev => [...prev.slice(-29), {
        timestamp: Date.now(),
        used: Math.random() * 50 * 1024 * 1024 + 100 * 1024 * 1024,
        total: 256 * 1024 * 1024,
        limit: 512 * 1024 * 1024
      }]);

      // Sample CPU
      setCpuHistory(prev => [...prev.slice(-29), {
        timestamp: Date.now(),
        usage: Math.random() * 40 + (isRecording ? 30 : 5)
      }]);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (!isRecording) {
      setTraceData([]);
      setIsRecording(true);
      // Simulate trace capturing
      setTimeout(() => {
        const mockTraces: TraceEntry[] = Array.from({ length: 150 }).map((_, i) => ({
          name: ['Render', 'Effect', 'Fetch', 'Click', 'Layout', 'Script'][Math.floor(Math.random() * 6)],
          startTime: i * 50 + Math.random() * 20,
          duration: Math.random() * 80 + 5,
          entryType: 'measure'
        }));
        setTraceData(mockTraces);
        setIsRecording(false);
      }, 3000);
    }
  };

  const runAIAnalysis = async () => {
    if (traceData.length === 0) return;
    setAnalyzing(true);
    const results = await analyzePerformanceWithAI(traceData, vitals);
    setRecommendations(results);
    setAnalyzing(false);
    setActiveTab('ai');
  };

  const navItems: { id: TabId; label: string }[] = [
    { id: 'runtime', label: 'Runtime Profiler' },
    { id: 'bundle', label: 'Bundle Visualizer' },
    { id: 'ai', label: 'AI Optimization' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'settings', label: 'Config' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-indigo-200 shadow-lg">P</div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight tracking-tight">Enterprise Performance Profiler</h1>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Powered by Gemini AI</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleRecording}
            disabled={isRecording}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-2 ${
              isRecording 
                ? 'bg-rose-100 text-rose-600 animate-pulse cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
            }`}
          >
            {isRecording ? <div className="w-2 h-2 bg-rose-600 rounded-full animate-ping"></div> : null}
            {isRecording ? 'Capturing Trace...' : 'Start Profiling'}
          </button>
          <button 
            onClick={runAIAnalysis}
            disabled={analyzing || traceData.length === 0}
            className="px-5 py-2.5 bg-white border border-indigo-200 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all active:scale-95 shadow-sm disabled:opacity-50"
          >
            {analyzing ? 'Analyzing...' : 'AI Recommendations'}
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 px-6 flex gap-8">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`py-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === item.id 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main className="flex-grow p-6 space-y-6">
        {/* Vitals Summary */}
        <VitalsGrid vitals={vitals} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MemoryChart data={memoryHistory} />
          <CPUChart data={cpuHistory} />
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm min-h-[500px]">
          {activeTab === 'runtime' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">Runtime Analysis</h2>
                {traceData.length > 0 && (
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold">
                    {traceData.length} entries recorded
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <FlameChart data={traceData} onSelect={setSelectedEntry} />
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 tracking-wider">Entry Inspector</h3>
                  {selectedEntry ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-slate-400 uppercase">Operation</p>
                        <p className="text-lg font-bold text-indigo-600">{selectedEntry.name}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-slate-400 uppercase">Start Time</p>
                          <p className="font-mono text-slate-700">{selectedEntry.startTime.toFixed(2)}ms</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-400 uppercase">Duration</p>
                          <p className="font-mono text-slate-700 font-bold">{selectedEntry.duration.toFixed(2)}ms</p>
                        </div>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-slate-200">
                        <p className="text-xs font-medium text-slate-400 uppercase mb-2">Diagnostic</p>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {selectedEntry.duration > 50 
                            ? "CRITICAL: This operation blocks the main thread for too long, potentially causing UI stuttering."
                            : "OPTIMIZED: Execution time within performance budget."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">
                      Select an entry from the chart to view details
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 leading-none">AI Recommendations</h2>
                  <p className="text-sm text-slate-500 mt-1">Generated by analyzing 150+ runtime trace entries</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {recommendations.length > 0 ? recommendations.map((rec, i) => (
                  <div key={i} className="group bg-white border border-slate-200 p-6 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          rec.priority === 'critical' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {rec.priority}
                        </span>
                        <h3 className="text-lg font-bold text-slate-800">{rec.title}</h3>
                      </div>
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">{rec.category}</span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">{rec.description}</p>
                    {rec.suggestedFix && (
                      <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Suggested Correction</p>
                        <pre className="text-indigo-300 text-xs font-mono">{rec.suggestedFix}</pre>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                    <p>No analysis results yet</p>
                    <button onClick={runAIAnalysis} className="mt-4 text-indigo-600 font-bold text-sm underline">Analyze performance now</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'bundle' && (
            <div className="p-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mx-auto">
                   <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Bundle Analysis Pipeline</h2>
                <p className="text-slate-500 leading-relaxed">Upload your Vite/Webpack stats.json to visualize package dependencies and code split impacts.</p>
                <div className="pt-6">
                   <label className="cursor-pointer bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                      Upload Stats JSON
                      <input type="file" className="hidden" />
                   </label>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'integrations' && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Connected Enterprise Ecosystem</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'GitHub Actions', status: 'Active', color: 'bg-emerald-500' },
                  { name: 'Jira Software', status: 'Connected', color: 'bg-indigo-500' },
                  { name: 'Datadog RUM', status: 'Paused', color: 'bg-slate-400' },
                  { name: 'Cloudflare Workers', status: 'Syncing', color: 'bg-amber-500' },
                  { name: 'Sentry IO', status: 'Active', color: 'bg-emerald-500' },
                  { name: 'Slack Alerts', status: 'Active', color: 'bg-emerald-500' }
                ].map((int, i) => (
                  <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl flex items-center justify-between group hover:border-indigo-300 transition-all">
                    <div>
                      <p className="font-bold text-slate-800">{int.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className={`w-2 h-2 rounded-full ${int.color}`}></div>
                        <span className="text-xs font-medium text-slate-500">{int.status}</span>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">Configure</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 flex justify-between items-center">
        <p className="text-xs font-medium text-slate-400">© 2024 Citibank Demo Business Inc. Enterprise Grade Performance Solutions.</p>
        <div className="flex gap-4 text-xs font-bold text-slate-500">
          <a href="#" className="hover:text-indigo-600">Privacy Policy</a>
          <a href="#" className="hover:text-indigo-600">Compliance Audit</a>
          <a href="#" className="hover:text-indigo-600">SLA Dashboard</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
