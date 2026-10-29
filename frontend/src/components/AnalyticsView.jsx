import React, { useState } from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  CloudRain,
  MapPin,
  Calendar,
  Layers,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

const DEMAND_COLORS = {
  Low: '#10b981',
  Medium: '#06b6d4',
  High: '#f43f5e',
};

export default function AnalyticsView({ analytics }) {
  const [selectedArea, setSelectedArea] = useState('All');

  if (!analytics || !analytics.summary) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm">Loading dataset analytics...</p>
      </div>
    );
  }

  const {
    summary,
    demand_distribution,
    area_comparison,
    hourly_trends,
    correlation_matrix,
    day_type_impact,
    event_impact,
    scatter_sample,
  } = analytics;

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-xs font-semibold mb-2">
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Real Dataset Analytics</span>
        </div>
        <h1 className="text-3xl font-heading font-extrabold text-white">
          EV Charging Grid Analytics
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Visualizations calculated directly from the {summary.total_records?.toLocaleString()} records in{' '}
          <code className="text-cyan-400 font-mono text-xs">data/ev_charging_demand.csv</code>.
        </p>
      </div>

      {/* Row 1: Demand Class Distribution & 24-Hour Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Donut Chart: Demand Distribution (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-cyan-400" />
              <span>Demand Distribution</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Target class breakdown ({summary.total_records?.toLocaleString()} observations)
            </p>
          </div>

          <div className="h-60 w-full my-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demand_distribution}
                  dataKey="count"
                  nameKey="demand"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {demand_distribution.map((entry) => (
                    <Cell key={entry.demand} fill={DEMAND_COLORS[entry.demand] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val, name, item) => [`${val.toLocaleString()} records (${item.payload.percentage}%)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center">
            {demand_distribution.map((d) => (
              <div key={d.demand} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-bold block" style={{ color: DEMAND_COLORS[d.demand] }}>
                  {d.demand}
                </span>
                <span className="text-xs font-heading font-bold text-slate-200 block">
                  {d.count.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500">{d.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Area Chart: 24-Hour Diurnal Wave (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span>24-Hour Diurnal Charging Profile</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mean EV arrivals and station occupancy percentage across hours 00:00 to 23:00.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                Avg Arrivals
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                Occupancy %
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourly_trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorArrivals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour_label" stroke="#64748b" fontSize={11} interval={2} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="avg_arrivals" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorArrivals)" name="Mean EV Arrivals" />
                <Area type="monotone" dataKey="avg_occupancy" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorOccupancy)" name="Mean Occupancy %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Location Demand Comparison & Event/Weekend Impacts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Bar Chart: Area-Wise Comparison (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-400" />
                <span>Station Area Demand Profiles</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Breakdown of High, Medium, and Low demand instances across all 5 monitored urban hubs.
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={area_comparison} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="area" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Low" fill="#10b981" radius={[4, 4, 0, 0]} name="Low Demand" />
                <Bar dataKey="Medium" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Medium Demand" />
                <Bar dataKey="High" fill="#f43f5e" radius={[4, 4, 0, 0]} name="High Demand" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event & Day Type Impacts (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-400" />
              <span>Event & Day Type Surge Impact</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              How special nearby events and weekend schedules shift high demand probability.
            </p>
          </div>

          <div className="space-y-4 my-4">
            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-2">Nearby Event Influence:</span>
              <div className="space-y-2">
                {event_impact.map((e) => (
                  <div key={e.event} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between text-xs font-bold text-slate-200 mb-1">
                      <span>{e.event}</span>
                      <span className="text-rose-400">{e.High}% High Surge</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                      <div style={{ width: `${e.Low}%` }} className="bg-emerald-500 h-full" title={`Low: ${e.Low}%`}></div>
                      <div style={{ width: `${e.Medium}%` }} className="bg-cyan-500 h-full" title={`Medium: ${e.Medium}%`}></div>
                      <div style={{ width: `${e.High}%` }} className="bg-rose-500 h-full" title={`High: ${e.High}%`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-2">Weekday vs. Weekend Pattern:</span>
              <div className="space-y-2">
                {day_type_impact.map((d) => (
                  <div key={d.day_type} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between text-xs font-bold text-slate-200 mb-1">
                      <span>{d.day_type}</span>
                      <span className="text-rose-400">{d.High}% High Surge</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                      <div style={{ width: `${d.Low}%` }} className="bg-emerald-500 h-full" title={`Low: ${d.Low}%`}></div>
                      <div style={{ width: `${d.Medium}%` }} className="bg-cyan-500 h-full" title={`Medium: ${d.Medium}%`}></div>
                      <div style={{ width: `${d.High}%` }} className="bg-rose-500 h-full" title={`High: ${d.High}%`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span>Nearby events trigger up to a 3.5x increase in High Demand surges.</span>
          </div>
        </div>
      </div>

      {/* Row 3: Correlation Matrix Heatmap */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>Feature Correlation Matrix (Pearson r)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Pairwise numerical correlation coefficients from the cleaned dataset.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Feature</th>
                <th className="py-3 px-4">Hour</th>
                <th className="py-3 px-4">Temperature</th>
                <th className="py-3 px-4">EV Arrivals</th>
                <th className="py-3 px-4">Occupancy Rate</th>
                <th className="py-3 px-4">Rainfall</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {correlation_matrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-sans font-bold text-white">{row.feature}</td>
                  {['Hour', 'Temperature', 'EV_Arrivals', 'Occupancy_Rate', 'Rainfall'].map((col) => {
                    const val = row[col];
                    const isSelf = row.feature === col;
                    const isPositive = val > 0.3;
                    const isNegative = val < -0.3;
                    return (
                      <td
                        key={col}
                        className={`py-3 px-4 ${
                          isSelf
                            ? 'text-slate-500 font-normal'
                            : isPositive
                            ? 'text-cyan-400 font-bold bg-cyan-950/20'
                            : isNegative
                            ? 'text-rose-400 font-bold bg-rose-950/20'
                            : 'text-slate-300'
                        }`}
                      >
                        {val > 0 && !isSelf ? `+${val}` : val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
