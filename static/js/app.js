const API = '';  // same origin

// ── State ──
let stats = { total: 0, critical: 0, routine: 0, cleaned: 0 };
let history = [];

// ── DOM refs ──
const $ = id => document.getElementById(id);

// ── Health check ──
async function checkHealth() {
  const dot  = $('status-dot');
  const text = $('status-text');
  try {
    const r = await fetch(`${API}/health`);
    if (r.ok) {
      dot.className = 'dot online';
      text.textContent = 'Service Online';
    } else throw new Error();
  } catch {
    dot.className = 'dot offline';
    text.textContent = 'Service Offline';
  }
}

// ── Update stat cards ──
function updateStats() {
  $('stat-total').textContent    = stats.total;
  $('stat-critical').textContent = stats.critical;
  $('stat-routine').textContent  = stats.routine;
  $('stat-cleaned').textContent  = stats.cleaned;
}

// ── Render priority banner ──
function priorityBanner(rating) {
  const map = {
    CRITICAL_ACTION: { cls: 'critical', icon: '🚨', label: 'CRITICAL ACTION' },
    ROUTINE_READ:    { cls: 'routine',  icon: '✅', label: 'ROUTINE READ'    },
    UNASSIGNED:      { cls: 'unassigned', icon: '📭', label: 'UNASSIGNED'    },
  };
  const p = map[rating] || map.UNASSIGNED;
  return `
    <div class="priority-banner ${p.cls}">
      <span class="priority-icon">${p.icon}</span>
      <div class="priority-info">
        <div class="label">PRIORITY</div>
        <div class="value">${p.label}</div>
      </div>
    </div>`;
}

// ── Render result ──
function showResult(data) {
  const m = data.metrics;
  $('result-panel').innerHTML = `
    <div class="result-body">
      ${priorityBanner(m.priority_rating)}
      <div class="result-section">
        <label>SUMMARY</label>
        <div class="result-box">${escHtml(m.summary)}</div>
      </div>
      <div class="result-section">
        <label>CLEANED CONTEXT</label>
        <div class="result-box">${escHtml(data.purged_context)}</div>
      </div>
      ${m.suggested_response_template ? `
      <div class="result-section">
        <label>SUGGESTED RESPONSE</label>
        <div class="result-box response">${escHtml(m.suggested_response_template)}</div>
      </div>` : ''}
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <span class="badge ${data.pipeline_mode === 'AceVane_Mock_Protected' ? 'badge-purple' : 'badge-yellow'}">
          ${data.pipeline_mode}
        </span>
        <span class="badge badge-green">${data.status}</span>
      </div>
    </div>`;
}

// ── Add history row ──
function addHistory(sender, rating, mode) {
  history.unshift({ sender, rating, mode, time: new Date() });
  if (history.length > 50) history.pop();
  renderHistory();
}

function renderHistory() {
  const tbody = $('history-body');
  if (!history.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:24px">No emails processed yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = history.map(h => {
    const ratingBadge = h.rating === 'CRITICAL_ACTION'
      ? `<span class="badge badge-red">CRITICAL</span>`
      : h.rating === 'ROUTINE_READ'
      ? `<span class="badge badge-green">ROUTINE</span>`
      : `<span class="badge">UNASSIGNED</span>`;
    return `
      <tr>
        <td class="truncate">${escHtml(h.sender)}</td>
        <td>${ratingBadge}</td>
        <td><span class="badge badge-purple" style="font-size:10px">${h.mode === 'AceVane_Mock_Protected' ? 'AceVane' : 'Live'}</span></td>
        <td class="time">${timeAgo(h.time)}</td>
      </tr>`;
  }).join('');
}

// ── Form submit ──
$('process-form').addEventListener('submit', async e => {
  e.preventDefault();
  const btn    = $('submit-btn');
  const panel  = $('result-panel');
  const sender = $('sender').value.trim();
  const body   = $('raw-body').value.trim();
  const acevane = $('use-acevane').checked;

  btn.disabled = true;
  btn.textContent = 'Processing…';
  panel.innerHTML = `<div class="result-empty"><div class="spinner"></div><span>Analysing thread…</span></div>`;

  try {
    const r = await fetch(`${API}/email/process-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_body: body, sender, use_acevane: acevane }),
    });

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(err.detail?.[0]?.msg || `HTTP ${r.status}`);
    }

    const data = await r.json();
    showResult(data);

    // Update stats
    stats.total++;
    stats.cleaned++;
    if (data.metrics.priority_rating === 'CRITICAL_ACTION') stats.critical++;
    else if (data.metrics.priority_rating === 'ROUTINE_READ') stats.routine++;
    updateStats();
    addHistory(sender, data.metrics.priority_rating, data.pipeline_mode);
  } catch (err) {
    panel.innerHTML = `
      <div class="result-empty">
        <span class="emoji">❌</span>
        <span>${escHtml(err.message)}</span>
      </div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Process Email';
  }
});

// ── Helpers ──
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function timeAgo(d) {
  const sec = Math.floor((Date.now() - d) / 1000);
  if (sec < 5)  return 'just now';
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec/60)}m ago`;
  return `${Math.floor(sec/3600)}h ago`;
}

// ── Init ──
checkHealth();
setInterval(checkHealth, 10000);
setInterval(renderHistory, 15000); // refresh "time ago"
updateStats();
renderHistory();
