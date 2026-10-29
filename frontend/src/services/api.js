/**
 * API client service for EV Charging Demand Prediction backend.
 */

const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed with status ${res.status}`);
  return res.json();
}

export async function fetchModelInfo() {
  const res = await fetch(`${API_BASE}/model-info`);
  if (!res.ok) throw new Error(`Failed to load model info: ${res.statusText}`);
  return res.json();
}

export async function fetchAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error(`Failed to load analytics: ${res.statusText}`);
  return res.json();
}

export async function predictDemand(payload) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    let msg = errorData.detail || 'Failed to generate prediction';
    if (Array.isArray(errorData.detail)) {
      msg = errorData.detail.map(d => `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg}`).join(', ');
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function fetchHistory(params = {}) {
  const query = new URLSearchParams();
  if (params.limit) query.append('limit', params.limit);
  if (params.offset) query.append('offset', params.offset);
  if (params.area) query.append('area', params.area);
  if (params.demand) query.append('demand', params.demand);

  const res = await fetch(`${API_BASE}/history?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch prediction history');
  return res.json();
}

export async function deleteHistoryItem(id) {
  const res = await fetch(`${API_BASE}/history/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete history item');
  return res.json();
}

export async function clearHistory() {
  const res = await fetch(`${API_BASE}/history`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to clear prediction history');
  return res.json();
}
