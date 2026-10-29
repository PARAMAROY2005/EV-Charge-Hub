import React, { useState } from 'react';
import {
  Zap,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Thermometer,
  CloudRain,
  Calendar,
  Clock,
  Car,
  Percent,
  MapPin,
  TrendingUp,
  Cpu,
  ArrowRight,
  Info
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { predictDemand } from '../services/api';

const LOCATIONS = ['Sector V', 'Park Street', 'Salt Lake', 'New Town', 'Rajarhat'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PredictionView({ initialPayload, onPredictionSuccess }) {
  const [formData, setFormData] = useState({
    hour: initialPayload?.hour ?? 14,
    temperature: initialPayload?.temperature ?? 28.5,
    area: initialPayload?.area ?? 'Sector V',
    day_type: initialPayload?.day_type ?? 'Weekday',
    ev_arrivals: initialPayload?.ev_arrivals ?? 85,
    occupancy_rate: initialPayload?.occupancy_rate ?? 65.0,
    nearby_event: initialPayload?.nearby_event ?? 'No',
    rainfall: initialPayload?.rainfall ?? 0.0,
    day_of_week: initialPayload?.day_of_week ?? 2,
    month: initialPayload?.month ?? 6,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Derive time period live
  const getTimePeriod = (h) => {
    if (h >= 5 && h < 12) return 'Morning (05:00 - 11:59)';
    if (h >= 12 && h < 17) return 'Afternoon (12:00 - 16:59)';
    if (h >= 17 && h < 21) return 'Evening (17:00 - 20:59)';
    return 'Night (21:00 - 04:59)';
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      // Keep Day_Type synced with day_of_week if day changes
      if (field === 'day_of_week') {
        next.day_type = value >= 5 ? 'Weekend' : 'Weekday';
      }
      return next;
    });
  };

  const handleReset = () => {
    setFormData({
      hour: 14,
      temperature: 28.5,
      area: 'Sector V',
      day_type: 'Weekday',
      ev_arrivals: 85,
      occupancy_rate: 65.0,
      nearby_event: 'No',
      rainfall: 0.0,
      day_of_week: 2,
      month: 6,
    });
    setError(null);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await predictDemand(formData);
      setResult(response);
      if (onPredictionSuccess) {
        onPredictionSuccess(response);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during inference');
    } finally {
      setLoading(false);
    }
  };

  // Format probabilities for chart
  const probChartData = result?.probabilities
    ? [
        { name: 'Low', prob: result.probabilities.Low, color: '#10b981' },
        { name: 'Medium', prob: result.probabilities.Medium, color: '#06b6d4' },
        { name: 'High', prob: result.probabilities.High, color: '#f43f5e' },
      ]
    : [];

  const getDemandColor = (demand) => {
    switch (demand) {
      case 'High':
        return {
          bg: 'bg-rose-500/15',
          border: 'border-rose-500/40',
          text: 'text-rose-400',
          badge: 'bg-rose-500 text-white',
          glow: 'glow-amber',
        };
      case 'Medium':
        return {
          bg: 'bg-cyan-500/15',
          border: 'border-cyan-500/40',
          text: 'text-cyan-400',
          badge: 'bg-cyan-500 text-slate-950 font-bold',
          glow: 'glow-cyan',
        };
      default:
        return {
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/40',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500 text-slate-950 font-bold',
          glow: 'glow-emerald',
        };
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-xs font-semibold mb-2">
          <Zap className="h-3.5 w-3.5" />
          <span>Real-Time ML Inference</span>
        </div>
        <h1 className="text-3xl font-heading font-extrabold text-white">
          Predict EV Charging Demand
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Enter operational parameters to run inference against our trained Scikit-learn
          Logistic Regression pipeline with ColumnTransformer preprocessing.
        </p>
      </div>

      {/* Main Grid: Form + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
              <Cpu className="h-5 w-5 text-cyan-400" />
              <span>Input Parameters</span>
            </h2>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Values</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Hub Location */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                <span>Charging Hub Location</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleInputChange('area', loc)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition text-center ${
                      formData.area === loc
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Hour & Derived Period */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Time of Day (Hour: 00 - 23)</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {String(formData.hour).padStart(2, '0')}:00
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {getTimePeriod(formData.hour).split(' ')[0]}
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="23"
                value={formData.hour}
                onChange={(e) => handleInputChange('hour', parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>00:00 (Midnight)</span>
                <span>06:00</span>
                <span>12:00 (Noon)</span>
                <span>18:00</span>
                <span>23:00</span>
              </div>
            </div>

            {/* 3. EV Arrivals & Occupancy Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Expected EV Arrivals */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Car className="h-3.5 w-3.5 text-teal-400" />
                    <span>EV Arrivals (Count)</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-teal-400">
                    {formData.ev_arrivals} EVs
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="140"
                  value={formData.ev_arrivals}
                  onChange={(e) => handleInputChange('ev_arrivals', parseInt(e.target.value))}
                  className="w-full accent-teal-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Observed dataset range: 48 - 117 EVs
                </span>
              </div>

              {/* Station Occupancy Rate */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Percent className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Station Occupancy</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {formData.occupancy_rate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="0.5"
                  value={formData.occupancy_rate}
                  onChange={(e) => handleInputChange('occupancy_rate', parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden flex">
                  <div
                    style={{ width: `${formData.occupancy_rate}%` }}
                    className={`h-full transition-all duration-300 ${
                      formData.occupancy_rate > 75
                        ? 'bg-rose-500'
                        : formData.occupancy_rate > 45
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            {/* 4. Weather: Temperature & Rainfall */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Temperature */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Thermometer className="h-3.5 w-3.5 text-amber-400" />
                    <span>Temperature</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {formData.temperature}°C
                  </span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="45"
                  step="0.5"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                  className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Kolkata seasonal climate: 12°C - 44°C
                </span>
              </div>

              {/* Rainfall */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <CloudRain className="h-3.5 w-3.5 text-blue-400" />
                    <span>Rainfall</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-blue-400">
                    {formData.rainfall} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  step="0.5"
                  value={formData.rainfall}
                  onChange={(e) => handleInputChange('rainfall', parseFloat(e.target.value))}
                  className="w-full accent-blue-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {formData.rainfall === 0 ? 'Clear weather (No precipitation)' : 'Precipitation active'}
                </span>
              </div>
            </div>

            {/* 5. Day Type, Event, and Month */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Day of Week */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Day of Week</label>
                <select
                  value={formData.day_of_week}
                  onChange={(e) => handleInputChange('day_of_week', parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {DAYS.map((d, idx) => (
                    <option key={d} value={idx}>
                      {d} {idx >= 5 ? '(Weekend)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Month</label>
                <select
                  value={formData.month}
                  onChange={(e) => handleInputChange('month', parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {MONTHS.map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nearby Event */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Nearby Event?</label>
                <div className="grid grid-cols-2 gap-2">
                  {['No', 'Yes'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleInputChange('nearby_event', opt)}
                      className={`py-2 rounded-xl text-xs font-bold border transition text-center ${
                        formData.nearby_event === opt
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Running ML Pipeline...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 fill-slate-950" />
                  <span>Execute Model Prediction</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span className="font-heading font-bold text-white text-base">Inference Output</span>
                </div>
                {result.record_id && (
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    ID #{result.record_id}
                  </span>
                )}
              </div>

              {/* Demand Badge */}
              {(() => {
                const style = getDemandColor(result.predicted_demand);
                return (
                  <div className={`rounded-2xl p-5 border ${style.bg} ${style.border} text-center mb-6`}>
                    <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1">
                      Classified Demand Level
                    </span>
                    <div className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-white flex items-center justify-center gap-3">
                      <span>{result.predicted_demand}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full ${style.badge}`}>
                        {result.confidence}% Confidence
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Probability Breakdown Chart */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Calibrated Class Probabilities</span>
                </h4>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={probChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} unit="%" />
                      <YAxis dataKey="name" type="category" tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 'bold' }} />
                      <Tooltip
                        contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(val) => [`${val}%`, 'Probability']}
                      />
                      <Bar dataKey="prob" radius={[0, 6, 6, 0]}>
                        {probChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Operational Recommendation */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-6">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Operational Recommendation</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {result.recommendation}
                </p>
              </div>

              {/* Engineered Features Details */}
              <div className="border-t border-slate-800 pt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Pipeline-Engineered Features
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Time Period</span>
                    <span className="font-bold text-slate-200">{result.engineered_features.time_period}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Is Weekend?</span>
                    <span className="font-bold text-slate-200">
                      {result.engineered_features.is_weekend ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Arrival / Occ</span>
                    <span className="font-bold text-slate-200 font-mono">
                      {result.engineered_features.arrival_per_occupancy}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[420px]">
              <div className="h-16 w-16 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-500 mb-4">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-300">Ready for Prediction</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-2 leading-relaxed">
                Adjust input parameters on the left and click "Execute Model Prediction" to view real-time classification and load balance advice.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs text-cyan-400/80 bg-cyan-950/40 border border-cyan-900/60 px-3 py-1.5 rounded-full">
                <Info className="h-3.5 w-3.5" />
                <span>Predictions automatically save to SQLite history</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
