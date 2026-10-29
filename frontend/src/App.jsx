import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import OverviewDashboard from './components/OverviewDashboard';
import PredictionView from './components/PredictionView';
import AnalyticsView from './components/AnalyticsView';
import HistoryView from './components/HistoryView';
import { fetchHealth, fetchAnalytics, fetchModelInfo } from './services/api';
import { Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [health, setHealth] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [scenarioPayload, setScenarioPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [healthData, analyticsData, modelData] = await Promise.allSettled([
          fetchHealth(),
          fetchAnalytics(),
          fetchModelInfo(),
        ]);

        if (healthData.status === 'fulfilled') setHealth(healthData.value);
        if (analyticsData.status === 'fulfilled') setAnalytics(analyticsData.value);
        if (modelData.status === 'fulfilled') setModelInfo(modelData.value);
      } catch (err) {
        console.error('Failed to load initial platform metadata:', err);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  const handleSelectScenario = (payload) => {
    setScenarioPayload(payload);
    setActiveTab('predict');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} health={health} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'overview' && (
          <OverviewDashboard
            analytics={analytics}
            modelInfo={modelInfo}
            onNavigateToPredict={() => setActiveTab('predict')}
            onSelectScenario={handleSelectScenario}
          />
        )}

        {activeTab === 'predict' && (
          <PredictionView
            initialPayload={scenarioPayload}
            onPredictionSuccess={() => {
              // Refresh health or prediction counts if desired
            }}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsView analytics={analytics} />}

        {activeTab === 'history' && (
          <HistoryView onNavigateToPredict={() => setActiveTab('predict')} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-400" />
            <span className="font-heading font-bold text-slate-200">
              EV Charge Hub — Demand Prediction System
            </span>
            <span className="text-slate-600">|</span>
            <span>B.Tech Full-Stack ML Portfolio</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
              FastAPI
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              React + Vite
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>
              Scikit-Learn
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
              SQLite
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
              Tailwind CSS
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
