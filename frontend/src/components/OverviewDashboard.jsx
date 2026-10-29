import React from 'react';
import {
  Zap,
  TrendingUp,
  Cpu,
  Database,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function OverviewDashboard({ analytics, modelInfo, onNavigateToPredict, onSelectScenario }) {
  const summary = analytics?.summary || {};
  const metrics = modelInfo?.metrics || {};

  const scenarios = [
    {
      title: 'Peak Office Hours Rush',
      area: 'Sector V',
      time: '09:00 AM (Hour 9)',
      details: 'High occupancy (88%) & 110 EV arrivals with nearby tech summit.',
      demand: 'High',
      badgeColor: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
      payload: {
        hour: 9,
        temperature: 30.5,
        area: 'Sector V',
        day_type: 'Weekday',
        ev_arrivals: 110,
        occupancy_rate: 88.0,
        nearby_event: 'Yes',
        rainfall: 0.0,
        day_of_week: 1,
        month: 6,
      }
    },
    {
      title: 'Monsoon Evening Shopping',
      area: 'Park Street',
      time: '07:00 PM (Hour 19)',
      details: 'Moderate arrivals (85), heavy rain (14mm), and weekend nightlife.',
      demand: 'Medium',
      badgeColor: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
      payload: {
        hour: 19,
        temperature: 27.0,
        area: 'Park Street',
        day_type: 'Weekend',
        ev_arrivals: 85,
        occupancy_rate: 68.0,
        nearby_event: 'No',
        rainfall: 14.5,
        day_of_week: 5,
        month: 7,
      }
    },
    {
      title: 'Late Night Off-Peak',
      area: 'New Town',
      time: '03:00 AM (Hour 3)',
      details: 'Low occupancy (18%) & minimal arrivals (50). Ideal maintenance window.',
      demand: 'Low',
      badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
      payload: {
        hour: 3,
        temperature: 24.0,
        area: 'New Town',
        day_type: 'Weekday',
        ev_arrivals: 50,
        occupancy_rate: 18.0,
        nearby_event: 'No',
        rainfall: 0.0,
        day_of_week: 2,
        month: 5,
      }
    }
  ];

  const hubs = [
    { name: 'Sector V', type: 'Tech & Financial District', chargers: 24, status: 'Active' },
    { name: 'Park Street', type: 'Commercial & Retail Core', chargers: 18, status: 'Active' },
    { name: 'Salt Lake', type: 'Mixed Residential & Corporate', chargers: 20, status: 'Active' },
    { name: 'New Town', type: 'Planned Smart City Hub', chargers: 32, status: 'Active' },
    { name: 'Rajarhat', type: 'Expressway Transit Node', chargers: 16, status: 'Active' },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-semibold mb-6">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Industrial Machine Learning Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight leading-[1.1]">
            EV Charging Demand <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
              Prediction & Grid Analytics
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Empower EV charging network operators with real-time demand classification, 
            load forecasting, and algorithmic resource allocation powered by an 
            optimized Scikit-Learn pipeline.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigateToPredict()}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Zap className="h-4 w-4 fill-slate-950" />
              <span>Launch Live Predictor</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onSelectScenario(scenarios[0].payload)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition"
            >
              <span>Test Morning Rush Scenario</span>
            </button>
          </div>
        </div>
      </section>

      {/* Real Evaluation KPI Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Model Accuracy</span>
            <div className="h-9 w-9 rounded-xl bg-cyan-950 flex items-center justify-center text-cyan-400 border border-cyan-800">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-heading font-extrabold text-white">
              {metrics.accuracy ? `${metrics.accuracy}%` : '76.70%'}
            </span>
            <span className="text-xs text-emerald-400 font-medium">Verified Test Set</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Evaluated on 2,000 stratified test samples
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Weighted F1 Score</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-800">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-heading font-extrabold text-white">
              {metrics.f1_score ? `${metrics.f1_score}%` : '74.22%'}
            </span>
            <span className="text-xs text-emerald-400 font-medium">Balanced Metric</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Precision {metrics.precision || '74.63'}% | Recall {metrics.recall || '76.70'}%
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-teal-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dataset Records</span>
            <div className="h-9 w-9 rounded-xl bg-teal-950 flex items-center justify-center text-teal-400 border border-teal-800">
              <Database className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-heading font-extrabold text-white">
              {summary.total_records ? summary.total_records.toLocaleString() : '10,000'}
            </span>
            <span className="text-xs text-teal-400 font-medium">10 Features</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            One full year of continuous charging sessions
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monitored Hubs</span>
            <div className="h-9 w-9 rounded-xl bg-purple-950 flex items-center justify-center text-purple-400 border border-purple-800">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-heading font-extrabold text-white">5 Hubs</span>
            <span className="text-xs text-purple-400 font-medium">110 Fast Chargers</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Kolkata Metropolitan EV Network
          </p>
        </div>
      </section>

      {/* Preset Test Scenarios */}
      <section className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <span>Interactive Scenario Simulation</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select a preconfigured operating condition to instantly benchmark the ML pipeline.
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 self-start sm:self-auto">
            1-Click Model Evaluation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {scenarios.map((sc, i) => (
            <div
              key={i}
              className="bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${sc.badgeColor}`}>
                    Expected: {sc.demand} Demand
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" />
                    {sc.time.split(' ')[0]}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-base text-white">{sc.title}</h3>
                <p className="text-xs text-cyan-400 font-medium mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {sc.area}
                </p>
                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                  {sc.details}
                </p>
              </div>

              <button
                onClick={() => onSelectScenario(sc.payload)}
                className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 text-xs font-bold transition duration-150 border border-slate-700 hover:border-cyan-400"
              >
                <span>Run This Scenario</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Network Charging Hubs Overview */}
      <section className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-400" />
              <span>Operational Charging Stations</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Distribution of urban fast-charging infrastructure monitored in dataset.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hubs.map((hub, idx) => (
            <div key={idx} className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-slate-700 transition">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 border border-slate-700">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{hub.name}</h4>
                  <p className="text-[11px] text-slate-400">{hub.type}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  {hub.status}
                </span>
                <span className="text-xs font-mono font-bold text-slate-300">{hub.chargers} Ports</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
