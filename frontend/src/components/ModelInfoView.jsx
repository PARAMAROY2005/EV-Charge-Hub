import React from 'react';
import {
  Cpu,
  ShieldCheck,
  Layers,
  GitBranch,
  Database,
  BarChart2,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Award
} from 'lucide-react';

export default function ModelInfoView({ modelInfo }) {
  if (!modelInfo || !modelInfo.metrics) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm">Loading model specifications...</p>
      </div>
    );
  }

  const {
    algorithm,
    hyperparameters,
    preprocessing,
    dataset_size,
    train_test_split,
    metrics,
    confusion_matrix,
    confusion_matrix_labels,
    per_class_metrics,
    model_comparison,
    features,
    limitations
  } = modelInfo;

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-xs font-semibold mb-2">
          <Cpu className="h-3.5 w-3.5" />
          <span>Machine Learning Specifications</span>
        </div>
        <h1 className="text-3xl font-heading font-extrabold text-white">
          Model Architecture & Evaluation
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Complete, verified technical documentation of the trained model artifact,
          preprocessing pipeline, and evaluation metrics on test data.
        </p>
      </div>

      {/* Top Cards: Architecture & Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-4 w-4" />
                <span>Selected Production Model</span>
              </span>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                Scikit-Learn Pipeline
              </span>
            </div>

            <h2 className="text-2xl font-heading font-bold text-white mb-2">{algorithm}</h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Selected through systematic cross-validation over Random Forest and Decision Trees. 
              Provides robust multi-class probability calibration with low inference latency (sub-5ms) 
              essential for real-time grid balancing.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800 pt-5">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Inverse Reg (C)</span>
                <span className="text-sm font-mono font-bold text-slate-200">{hyperparameters.C}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Solver</span>
                <span className="text-sm font-mono font-bold text-slate-200">{hyperparameters.solver}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Max Iterations</span>
                <span className="text-sm font-mono font-bold text-slate-200">{hyperparameters.max_iter}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Train/Test Split</span>
                <span className="text-sm font-mono font-bold text-slate-200">80% / 20%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Metric Highlights */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-4">
            Test Set Performance (2,000 samples)
          </span>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs text-slate-300">Accuracy Score</span>
                <span className="text-xl font-heading font-extrabold text-cyan-400">{metrics.accuracy}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${metrics.accuracy}%` }} className="bg-cyan-500 h-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs text-slate-300">Weighted F1-Score</span>
                <span className="text-xl font-heading font-extrabold text-emerald-400">{metrics.f1_score}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${metrics.f1_score}%` }} className="bg-emerald-500 h-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs text-slate-300">Weighted Precision</span>
                <span className="text-xl font-heading font-extrabold text-teal-400">{metrics.precision}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${metrics.precision}%` }} className="bg-teal-500 h-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs text-slate-300">Weighted Recall</span>
                <span className="text-xl font-heading font-extrabold text-purple-400">{metrics.recall}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${metrics.recall}%` }} className="bg-purple-500 h-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Confusion Matrix & Classification Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Confusion Matrix (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7">
          <div className="mb-5">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span>Confusion Matrix</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluated on the 2,000 holdout test samples (Rows: True, Cols: Predicted).
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div></div>
              {confusion_matrix_labels.map((lbl) => (
                <div key={lbl} className="text-[11px] font-bold text-cyan-400 uppercase py-1">
                  Pred {lbl}
                </div>
              ))}

              {confusion_matrix.map((row, rIdx) => (
                <React.Fragment key={rIdx}>
                  <div className="text-[11px] font-bold text-slate-400 uppercase flex items-center justify-center">
                    True {confusion_matrix_labels[rIdx]}
                  </div>
                  {row.map((cellVal, cIdx) => {
                    const isDiagonal = rIdx === cIdx;
                    return (
                      <div
                        key={cIdx}
                        className={`p-3 rounded-xl font-mono text-sm font-bold flex flex-col items-center justify-center transition ${
                          isDiagonal
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                            : cellVal > 0
                            ? 'bg-slate-900 text-slate-400 border border-slate-800'
                            : 'bg-slate-900/40 text-slate-600'
                        }`}
                      >
                        <span>{cellVal}</span>
                        {isDiagonal && <span className="text-[9px] text-cyan-400/80">Correct</span>}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 text-center">
            Medium demand class achieves highest true positive rate (1,323 / 1,441).
          </p>
        </div>

        {/* Per-Class Metrics Table (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-emerald-400" />
                <span>Class-Specific Classification Metrics</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Precision, Recall, and F1-score breakdown for each target charging demand tier.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Class</th>
                    <th className="py-3 px-3">Precision</th>
                    <th className="py-3 px-3">Recall</th>
                    <th className="py-3 px-3">F1-Score</th>
                    <th className="py-3 px-3 text-right">Support</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {per_class_metrics.map((row) => (
                    <tr key={row.class} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-sans font-bold text-white flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            row.class === 'High'
                              ? 'bg-rose-500'
                              : row.class === 'Medium'
                              ? 'bg-cyan-400'
                              : 'bg-emerald-400'
                          }`}
                        ></span>
                        <span>{row.class} Demand</span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-200">{row.precision}%</td>
                      <td className="py-3 px-3 font-bold text-slate-200">{row.recall}%</td>
                      <td className="py-3 px-3 font-bold text-cyan-400">{row.f1_score}%</td>
                      <td className="py-3 px-3 text-right text-slate-400">{row.support} samples</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Model Comparison Table */}
          <div className="border-t border-slate-800 pt-5 mt-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Baseline Algorithm Benchmark Comparison
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {model_comparison.map((m) => (
                <div
                  key={m.model}
                  className={`p-3 rounded-xl border text-xs ${
                    m.selected
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="font-bold block truncate" title={m.model}>
                    {m.model.split(' ')[0]} {m.model.split(' ')[1]}
                  </span>
                  <div className="mt-1 flex justify-between font-mono text-[11px]">
                    <span>Acc: {m.accuracy}%</span>
                    <span>F1: {m.f1_score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Preprocessing Pipeline Architecture & Limitations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <h3 className="font-heading font-bold text-base text-white flex items-center gap-2 mb-4">
            <GitBranch className="h-4 w-4 text-cyan-400" />
            <span>Preprocessing & Pipeline Flow</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">Step 1: Raw Inputs & Validation</span>
              <p className="text-slate-400">
                FastAPI validates 10 raw parameters (Hour, Temperature, Area, Arrivals, Occupancy, Event, etc.) via Pydantic schemas.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-teal-400 font-bold block mb-1">Step 2: Feature Engineering</span>
              <p className="text-slate-400">
                Computes <code className="text-slate-200">Time_Period</code> (Morning/Afternoon/Evening/Night),{' '}
                <code className="text-slate-200">Is_Weekend</code>, and{' '}
                <code className="text-slate-200">Arrival_per_Occupancy</code> ratio.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">Step 3: Scikit-Learn ColumnTransformer</span>
              <ul className="text-slate-400 list-disc list-inside space-y-1 mt-1">
                <li>
                  <strong className="text-slate-300">OneHotEncoder(handle_unknown='ignore'):</strong> Area, Day_Type, Nearby_Event, Time_Period
                </li>
                <li>
                  <strong className="text-slate-300">StandardScaler():</strong> Hour, Temp, EV_Arrivals, Occupancy, Rainfall, Day_of_Week, Month, Is_Weekend, Arrival_per_Occupancy
                </li>
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-purple-400 font-bold block mb-1">Step 4: Estimator & Inference</span>
              <p className="text-slate-400">
                Multi-class Logistic Regression with <code className="text-slate-200">predict()</code> and calibrated <code className="text-slate-200">predict_proba()</code> for confidence scores.
              </p>
            </div>
          </div>
        </div>

        {/* Limitations & Real-world Considerations */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <span>Model Scope & Engineering Considerations</span>
            </h3>

            <div className="space-y-3 text-xs">
              {limitations.map((lim, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">{lim}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-slate-300 leading-relaxed">
              <strong className="text-cyan-300 block mb-1">Future Scalability Roadmap:</strong>
              Architected to seamlessly swap the underlying Scikit-learn estimator with XGBoost or LightGBM, or connect to a distributed PostgreSQL / TimescaleDB database for streaming sensor telemetry.
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
            Artifact Path: <code className="text-slate-400 font-mono">models/final_ev_charging_demand_model.pkl</code>
          </div>
        </div>
      </div>
    </div>
  );
}
