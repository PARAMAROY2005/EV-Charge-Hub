import React, { useState, useEffect } from 'react';
import {
  History,
  Trash2,
  Download,
  Filter,
  Search,
  AlertTriangle,
  MapPin,
  Clock,
  CheckCircle,
  RefreshCw,
  Zap
} from 'lucide-react';
import { fetchHistory, deleteHistoryItem, clearHistory } from '../services/api';

const LOCATIONS = ['All', 'Sector V', 'Park Street', 'Salt Lake', 'New Town', 'Rajarhat'];
const DEMAND_OPTIONS = ['All', 'Low', 'Medium', 'High'];

export default function HistoryView({ onNavigateToPredict }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedDemand, setSelectedDemand] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Confirmation modal for clear all
  const [showClearModal, setShowClearModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 100 };
      if (selectedArea !== 'All') params.area = selectedArea;
      if (selectedDemand !== 'All') params.demand = selectedDemand;
      const data = await fetchHistory(params);
      setHistory(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch prediction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [selectedArea, selectedDemand]);

  const handleDeleteItem = async (id) => {
    try {
      await deleteHistoryItem(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert('Could not delete history record: ' + err.message);
    }
  };

  const handleClearAll = async () => {
    setActionLoading(true);
    try {
      await clearHistory();
      setHistory([]);
      setShowClearModal(false);
    } catch (err) {
      alert('Could not clear history: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (history.length === 0) return;
    const headers = [
      'ID',
      'Timestamp (UTC)',
      'Area',
      'Hour',
      'Temperature (°C)',
      'Day Type',
      'EV Arrivals',
      'Occupancy Rate (%)',
      'Nearby Event',
      'Rainfall (mm)',
      'Predicted Demand',
      'Confidence (%)',
      'Recommendation'
    ];

    const rows = history.map((h) => [
      h.id,
      h.timestamp,
      `"${h.area}"`,
      h.hour,
      h.temperature,
      h.day_type,
      h.ev_arrivals,
      h.occupancy_rate,
      h.nearby_event,
      h.rainfall,
      h.predicted_demand,
      h.confidence,
      `"${(h.recommendation || '').replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ev_prediction_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Client-side search filtering
  const filteredHistory = history.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.area.toLowerCase().includes(q) ||
      item.predicted_demand.toLowerCase().includes(q) ||
      (item.recommendation && item.recommendation.toLowerCase().includes(q))
    );
  });

  const getDemandBadge = (demand) => {
    switch (demand) {
      case 'High':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'Medium':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-xs font-semibold mb-2">
            <History className="h-3.5 w-3.5" />
            <span>SQLite Audit Persistence</span>
          </div>
          <h1 className="text-3xl font-heading font-extrabold text-white">
            Prediction History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Persisted history of EV demand classification requests stored in SQLite.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={history.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowClearModal(true)}
            disabled={history.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold border border-rose-800/60 transition disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-400" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-semibold">Filters:</span>
          </div>

          {/* Area Filter */}
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                Area: {loc}
              </option>
            ))}
          </select>

          {/* Demand Filter */}
          <select
            value={selectedDemand}
            onChange={(e) => setSelectedDemand(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {DEMAND_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                Demand: {opt}
              </option>
            ))}
          </select>

          <button
            onClick={loadHistory}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Refresh history"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* History Table Container */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">Loading prediction history...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center p-6">
            <div className="h-14 w-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mb-3">
              <History className="h-7 w-7" />
            </div>
            <h3 className="font-heading font-bold text-base text-slate-300">
              No History Records Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5">
              No predictions match your current filter criteria. Run an ML prediction to generate new audit records.
            </p>
            <button
              onClick={onNavigateToPredict}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 hover:bg-cyan-400 transition"
            >
              <Zap className="h-3.5 w-3.5 fill-slate-950" />
              <span>Go to Prediction Form</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Station Area</th>
                  <th className="py-3.5 px-4">Operating Conditions</th>
                  <th className="py-3.5 px-4">Predicted Demand</th>
                  <th className="py-3.5 px-4">Confidence</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredHistory.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-slate-500 font-medium">#{row.id}</td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span>{new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(row.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-white flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-cyan-400" />
                        {row.area}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {row.day_type} (Hour {String(row.hour).padStart(2, '0')}:00)
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="bg-slate-950 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-800 text-teal-300">
                          {row.ev_arrivals} EVs
                        </span>
                        <span className="bg-slate-950 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-800 text-emerald-300">
                          {row.occupancy_rate}% Occ
                        </span>
                        <span className="bg-slate-950 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-800 text-amber-300">
                          {row.temperature}°C
                        </span>
                        {row.rainfall > 0 && (
                          <span className="bg-blue-950/60 px-2 py-0.5 rounded text-[10px] font-mono border border-blue-800/60 text-blue-300">
                            {row.rainfall}mm rain
                          </span>
                        )}
                        {row.nearby_event === 'Yes' && (
                          <span className="bg-purple-950/60 px-2 py-0.5 rounded text-[10px] font-semibold border border-purple-800/60 text-purple-300">
                            Event
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getDemandBadge(
                          row.predicted_demand
                        )}`}
                      >
                        {row.predicted_demand}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">
                      {row.confidence}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteItem(row.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                        title="Delete record"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Clear History */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl animate-fade-in">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h3 className="font-heading font-bold text-lg text-white">Clear All History?</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Are you sure you want to delete all {history.length} saved prediction records? This action permanently clears the SQLite database table and cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition flex items-center gap-2"
              >
                {actionLoading && <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                <span>Yes, Clear All</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
