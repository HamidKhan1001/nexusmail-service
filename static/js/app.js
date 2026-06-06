const API = '';

let stats   = { total: 847, critical: 63, routine: 784, cleaned: 847 };
let history = [];

const DEMO_HISTORY = [
  { sender: 'sarah.chen@acmecorp.com',      rating: 'CRITICAL_ACTION', mode: 'AceVane_Mock_Protected', minsAgo: 2  },
  { sender: 'james.o@partnerships.io',      rating: 'ROUTINE_READ',    mode: 'AceVane_Mock_Protected', minsAgo: 7  },
  { sender: 'alerts@pagerduty.com',         rating: 'CRITICAL_ACTION', mode: 'AceVane_Mock_Protected', minsAgo: 14 },
  { sender: 'mike.torres@devteam.co',       rating: 'ROUTINE_READ',    mode: 'AceVane_Mock_Protected', minsAgo: 21 },
  { sender: 'billing@stripe.com',           rating: 'ROUTINE_READ',    mode: 'AceVane_Mock_Protected', minsAgo: 35 },
  { sender: 'priya.nair@enterprise.com',    rating: 'CRITICAL_ACTION', mode: 'Live_Inference_Pass',    minsAgo: 48 },
  { sender: 'noreply@github.com',           rating: 'ROUTINE_READ',    mode: 'AceVane_Mock_Protected', minsAgo: 55 },
  { sender: 'cto@startup.xyz',              rating: 'CRITICAL_ACTION', mode: 'AceVane_Mock_Protected', minsAgo: 72 },
  { sender: 'hr@company.com',               rating: 'ROUTINE_READ',    mode: 'AceVane_Mock_Protected', minsAgo: 90 },
  { sender: 'devops@infra.internal',        rating: 'CRITICAL_ACTION', mode: 'Live_Inference_Pass',    minsAgo: 118 },
  { sender: 'newsletter@producthunt.com',   rating: 'ROUTINE_READ',    mode: 'AceVane_Mock_Protected', minsAgo: 134 },
  { sender: 'legal@contracts.io',           rating: 'ROUTINE_READ',    mode: 'AceVane_Mock_Protected', minsAgo: 201 },
];

const DEMO_RESULT = {
  status: 'success',
  pipeline_mode: 'AceVane_Mock_Protected',
  purged_context: 'Hi team — production deploy is failing on the auth service. Rollback attempted at 14:32 UTC but the DB migration is blocking it. Need senior eng on this asap. Customers are seeing 503s on login.',
  metrics: {
    summary: 'High-priority production incident: auth service deployment failure with failed rollback. Active customer impact on login flow. Immediate engineering escalation required.',
    priority_rating: 'CRITICAL_ACTION',
    suggested_response_template: 'Acknowledged. Escalating to on-call senior engineer now. Will provide a status update within 15 minutes.',
  },
};

const $ = id => document.getElementById(id);

// ── Sidebar ──
function toggleSidebar() {
  $('sidebar').classList.toggle('open');
  $('overlay').classList.toggle('open');
}
function closeSidebar() {
  $('sidebar').classList.remove('open');
  $('overlay').classList.remove('open');
}
$('overlay').addEventListener('click', closeSidebar);

// ── Engine chip label ──
function updateEngineChip(cb) {
  const chip = $('engine-chip');
  chip.lastChild.textContent = cb.checked ? ' Local Engine' : ' Live Mode';
}

// ── Health ──
async function checkHealth() {
  const dot  = $('status-dot');
  const text = $('status-text');
  try {
    const r = await fetch(`${API}/health`, { signal: AbortSignal.timeout(4000) });
    if (r.ok) {
      dot.className  = 'status-indicator online';
      text.textContent = 'Service online';
    } else throw new Error();
  } catch {
    dot.className  = 'status-indicator offline';
    text.textContent = 'Unreachable';
  }
}

// ── Stats ──
function updateStats() {
  $('stat-total').textContent    = stats.total;
  $('stat-critical').textContent = stats.critical;
  $('stat-routine').textContent  = stats.routine;
  $('stat-cleaned').textContent  = stats.cleaned;
}

// ── Priority block ──
function priorityBlock(rating) {
  const cfg = {
    CRITICAL_ACTION: {
      cls: 'critical',
      icon: `<svg class="icon" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      label: 'Critical Action Required',
    },
    ROUTINE_READ: {
      cls: 'routine',
      icon: `<svg class="icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
      label: 'Routine Read',
    },
    UNASSIGNED: {
      cls: 'unassigned',
      icon: `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
      label: 'Unassigned',
    },
  };
  const p = cfg[rating] || cfg.UNASSIGNED;
  return `
    <div class="priority-block ${p.cls}">
      <div class="priority-icon-wrap">${p.icon}</div>
      <div class="priority-meta">
        <div class="priority-kicker">Priority Rating</div>
        <div class="priority-label">${p.label}</div>
      </div>
    </div>`;
}

// ── Priority chip HTML ──
function priorityChip(rating) {
  if (rating === 'CRITICAL_ACTION') return `<span class="chip chip-red">Critical</span>`;
  if (rating === 'ROUTINE_READ')    return `<span class="chip chip-green">Routine</span>`;
  return `<span class="chip chip-neutral">Unassigned</span>`;
}

// ── Pipeline chip ──
function pipelineChip(mode) {
  return mode === 'AceVane_Mock_Protected'
    ? `<span class="chip chip-blue">Local</span>`
    : `<span class="chip chip-amber">Live</span>`;
}

// ── Show result ──
function showResult(data) {
  const m = data.metrics;
  $('result-panel').innerHTML = `
    <div class="result-stack">
      ${priorityBlock(m.priority_rating)}
      <div class="result-section">
        <span class="field-label">Summary</span>
        <div class="result-box">${esc(m.summary)}</div>
      </div>
      <div class="result-section">
        <span class="field-label">Cleaned Context</span>
        <div class="result-box">${esc(data.purged_context)}</div>
      </div>
      ${m.suggested_response_template ? `
      <div class="result-section">
        <span class="field-label">Suggested Response</span>
        <div class="result-box highlight">${esc(m.suggested_response_template)}</div>
      </div>` : ''}
      <div class="result-chips">
        ${pipelineChip(data.pipeline_mode)}
        <span class="chip chip-neutral">
          <svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          ${esc(data.status)}
        </span>
      </div>
    </div>`;
}

// ── History ──
function addHistory(sender, rating, mode) {
  history.unshift({ sender, rating, mode, at: new Date() });
  if (history.length > 100) history.pop();
  renderHistory();
}

function renderHistory() {
  const tbody = $('history-body');
  $('history-count').textContent = `${history.length} record${history.length !== 1 ? 's' : ''}`;

  if (!history.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="4">No records yet — process an email thread to begin.</td></tr>`;
    return;
  }

  tbody.innerHTML = history.map(h => `
    <tr>
      <td class="cell-primary truncate cell-mono">${esc(h.sender)}</td>
      <td>${priorityChip(h.rating)}</td>
      <td>${pipelineChip(h.mode)}</td>
      <td class="cell-dim">${timeAgo(h.at)}</td>
    </tr>`).join('');
}

// ── Form submit ──
$('process-form').addEventListener('submit', async e => {
  e.preventDefault();
  const btn     = $('submit-btn');
  const panel   = $('result-panel');
  const sender  = $('sender').value.trim();
  const body    = $('raw-body').value.trim();
  const acevane = $('use-acevane').checked;

  btn.disabled = true;
  btn.innerHTML = `<div class="spinner"></div> Processing…`;
  panel.innerHTML = `
    <div class="result-empty">
      <div class="spinner" style="width:28px;height:28px"></div>
      <p>Analysing thread…</p>
    </div>`;

  try {
    const r = await fetch(`${API}/email/process-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_body: body, sender, use_acevane: acevane }),
    });

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      const msg = Array.isArray(err.detail)
        ? err.detail.map(d => d.msg).join(', ')
        : err.detail || `HTTP ${r.status}`;
      throw new Error(msg);
    }

    const data = await r.json();
    showResult(data);

    stats.total++;
    stats.cleaned++;
    if (data.metrics.priority_rating === 'CRITICAL_ACTION') stats.critical++;
    else if (data.metrics.priority_rating === 'ROUTINE_READ') stats.routine++;
    updateStats();
    addHistory(sender, data.metrics.priority_rating, data.pipeline_mode);

  } catch (err) {
    panel.innerHTML = `
      <div class="result-empty">
        <svg viewBox="0 0 24 24" style="color:var(--red);width:32px;height:32px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p>${esc(err.message)}</p>
      </div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      Process Email`;
  }
});

// ── Utils ──
function esc(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function timeAgo(d) {
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 5)    return 'just now';
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
}

// ── Init ──
const DEMO_EMAIL_BODY = `Hi team,

Production is down on the auth service — users are getting 503s on login since 14:28 UTC. Rollback at 14:32 failed due to a blocking DB migration.

URGENT — need senior eng escalation now.

--------- Original Message ---------
From: devops@infra.internal Sent: Mon 14:35
To: engineering@company.com
Subject: Re: [CRITICAL] Auth Service Down

Confirmed. Health checks failing on all 3 pods. PagerDuty alert #8821 open.

> On Mon, alerts@pagerduty.com wrote:
> ALERT: auth-service health check CRITICAL — 3/3 pods unhealthy`;

function loadDemo() {
  $('raw-body').value = DEMO_EMAIL_BODY;

  history = DEMO_HISTORY.map(d => ({
    sender: d.sender,
    rating: d.rating,
    mode:   d.mode,
    at:     new Date(Date.now() - d.minsAgo * 60 * 1000),
  }));
  showResult(DEMO_RESULT);
}

checkHealth();
loadDemo();
updateStats();
renderHistory();
setInterval(checkHealth, 10000);
setInterval(renderHistory, 20000);
