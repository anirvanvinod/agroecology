const kpis = [
  {
    id: 'activation',
    name: 'Activation',
    owner: 'Growth Ops',
    base: 84,
    target: 88,
    definition: 'Measures signup completion, KYC pass-rate, and app onboarding success.',
    metrics: ['Sign-up conversion', 'KYC pass <10 min', 'D1 app open'],
    recovery: 'Simplify KYC steps, improve error messaging, and deploy guided upload hints.'
  },
  {
    id: 'firstRide',
    name: 'First Ride Success',
    owner: 'Core Product',
    base: 77,
    target: 85,
    definition: 'Tracks whether first booked trip reaches successful completion without friction.',
    metrics: ['Booking success rate', 'Unlock reliability', 'Drop-off completion'],
    recovery: 'Reduce unlock latency and proactively surface retry guidance.'
  },
  {
    id: 'quality',
    name: 'Ride Quality',
    owner: 'Marketplace',
    base: 72,
    target: 86,
    definition: 'Captures smoothness, route confidence, and rider sentiment post-trip.',
    metrics: ['Ride rating', 'Trip interruption rate', 'Vehicle quality flags'],
    recovery: 'Expand predictive maintenance windows and prioritize critical geofence fixes.'
  },
  {
    id: 'safety',
    name: 'Safety / Compliance',
    owner: 'Trust & Safety',
    base: 81,
    target: 90,
    definition: 'Monitors helmets, geofencing compliance, incidents, and risky events.',
    metrics: ['Incidents per 1k rides', 'Compliance alerts', 'SOS response time'],
    recovery: 'Strengthen geofence quality assurance and improve incident triage response.'
  },
  {
    id: 'support',
    name: 'Support Resolution',
    owner: 'CX Operations',
    base: 69,
    target: 83,
    definition: 'Evaluates SLA adherence and first-contact resolution effectiveness.',
    metrics: ['FCR', 'Median resolution time', 'Post-ticket CSAT'],
    recovery: 'Route tickets by issue taxonomy and increase macro automation coverage.'
  },
  {
    id: 'retention',
    name: 'Retention',
    owner: 'Lifecycle',
    base: 75,
    target: 84,
    definition: 'Assesses repeat trip behavior by cohorts across 7/30/90-day windows.',
    metrics: ['W1 repeat', 'M1 retained riders', 'Churn risk index'],
    recovery: 'Tune reactivation nudges and optimize loyalty incentives by cohort.'
  }
];

const filterValues = {
  market: ['Global', 'London', 'Berlin', 'Dubai', 'Singapore'],
  vehicle: ['All', 'E-Scooter', 'E-Bike', 'Moped'],
  cohort: ['All', 'New (0-7d)', 'Growing (8-30d)', 'Mature (30+d)'],
  time: ['All day', 'AM Peak', 'Midday', 'PM Peak', 'Late Night']
};

const filterAdjustments = {
  market: { Global: 0, London: -1, Berlin: 2, Dubai: -2, Singapore: 1 },
  vehicle: { All: 0, 'E-Scooter': -1, 'E-Bike': 1, Moped: -2 },
  cohort: { All: 0, 'New (0-7d)': -3, 'Growing (8-30d)': 1, 'Mature (30+d)': 2 },
  time: { 'All day': 0, 'AM Peak': -2, Midday: 2, 'PM Peak': -3, 'Late Night': -4 }
};

const playbook = [
  {
    title: 'Activation breakdown in high-friction KYC markets',
    monitor: 'KYC completion funnel, doc retries, identity mismatch flags.',
    failure: 'Long verification loops causing >15% onboarding abandonment.',
    mitigation: 'Enable fallback verification vendor and launch proactive upload coaching.',
    escalation: 'Escalate to Regional Risk Lead + Vendor Manager within 4 hours.'
  },
  {
    title: 'First ride failures from unlock instability',
    monitor: 'Unlock timeout %, app-device handshake latency by OS.',
    failure: 'Unlock success below 95% during PM peak in dense zones.',
    mitigation: 'Deploy firmware rollback and add contextual in-flow retry UX.',
    escalation: 'Escalate to Device Ops incident channel and duty engineer immediately.'
  },
  {
    title: 'Support spikes after pricing/policy changes',
    monitor: 'Ticket volume by issue tag, FCR, and sentiment trend.',
    failure: 'Resolution SLA breach >20% and CSAT below 4.2/5.',
    mitigation: 'Trigger pre-approved macros and expand live-chat staffing windows.',
    escalation: 'Escalate to Market GM + CX Program Manager in same-day review.'
  }
];

const state = {
  selectedKpi: null,
  filters: {
    market: 'Global',
    vehicle: 'All',
    cohort: 'All',
    time: 'All day'
  }
};

const el = {
  kpiGrid: document.getElementById('kpiGrid'),
  kpiInsight: document.getElementById('kpiInsight'),
  dashboardBody: document.getElementById('dashboardBody'),
  trendChart: document.getElementById('trendChart'),
  heroMetrics: document.getElementById('heroMetrics'),
  playbookItems: document.getElementById('playbookItems'),
  resetAllBtn: document.getElementById('resetAllBtn'),
  impact: document.getElementById('impact'),
  feasibility: document.getElementById('feasibility'),
  urgency: document.getElementById('urgency'),
  impactValue: document.getElementById('impactValue'),
  feasibilityValue: document.getElementById('feasibilityValue'),
  urgencyValue: document.getElementById('urgencyValue'),
  priorityValue: document.getElementById('priorityValue'),
  priorityLabel: document.getElementById('priorityLabel')
};

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function healthClass(value, target) {
  if (value >= target) return 'status-good';
  if (value >= target - 8) return 'status-warn';
  return 'status-bad';
}

function healthLabel(value, target) {
  if (value >= target) return 'On-track';
  if (value >= target - 8) return 'Watchlist';
  return 'Critical';
}

function currentAdjustment() {
  return Object.entries(state.filters).reduce((sum, [key, value]) => {
    return sum + (filterAdjustments[key][value] ?? 0);
  }, 0);
}

function getComputedKpis() {
  const adjustment = currentAdjustment();
  return kpis.map((kpi) => {
    const current = clamp(kpi.base + adjustment, 45, 99);
    const gap = kpi.target - current;
    const priority = clamp(Math.round(gap * 8 + (100 - current) * 0.28), 0, 100);
    return { ...kpi, current, gap, priority };
  });
}

function renderHeroMetrics(data) {
  const avgHealth = Math.round(data.reduce((acc, item) => acc + item.current, 0) / data.length);
  const critical = data.filter((item) => item.current < item.target - 8).length;
  const highPriority = data.filter((item) => item.priority >= 70).length;

  el.heroMetrics.innerHTML = `
    <article class="metric-card"><div class="label">Average Journey Health</div><div class="value">${avgHealth}%</div></article>
    <article class="metric-card"><div class="label">Critical KPIs</div><div class="value">${critical}</div></article>
    <article class="metric-card"><div class="label">High-priority Opportunities</div><div class="value">${highPriority}</div></article>
    <article class="metric-card"><div class="label">Active Segment</div><div class="value">${state.filters.market}</div></article>
  `;
}

function renderKpiTree(data) {
  el.kpiGrid.innerHTML = '';

  data.forEach((kpi) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `kpi-node ${state.selectedKpi === kpi.id ? 'active' : ''}`;
    card.setAttribute('role', 'listitem');
    card.innerHTML = `
      <strong>${kpi.name}</strong>
      <div>${kpi.current}% / target ${kpi.target}%</div>
      <small>Owner: ${kpi.owner}</small>
      <div class="health-bar"><span style="width:${kpi.current}%"></span></div>
    `;

    card.addEventListener('click', () => {
      state.selectedKpi = kpi.id;
      renderAll();
    });

    el.kpiGrid.appendChild(card);
  });

  const selected = data.find((item) => item.id === state.selectedKpi) || data[0];
  state.selectedKpi = selected.id;
  el.kpiInsight.innerHTML = `
    <strong>${selected.name}</strong>
    <p>${selected.definition}</p>
    <p><b>Health:</b> ${selected.current}% (target ${selected.target}%)</p>
    <p><b>Metrics:</b> ${selected.metrics.join(', ')}</p>
    <p><b>Recovery actions:</b> ${selected.recovery}</p>
    <p><b>Owner:</b> ${selected.owner}</p>
  `;
}

function renderDashboard(data) {
  el.dashboardBody.innerHTML = '';

  data.forEach((kpi) => {
    const row = document.createElement('tr');
    const gapPrefix = kpi.gap > 0 ? '-' : '+';
    const statusCls = healthClass(kpi.current, kpi.target);
    const statusText = healthLabel(kpi.current, kpi.target);

    row.innerHTML = `
      <td>${kpi.name}</td>
      <td>${kpi.current}%</td>
      <td>${kpi.target}%</td>
      <td>${gapPrefix}${Math.abs(kpi.gap)}%</td>
      <td>${kpi.priority}</td>
      <td class="${statusCls}">${statusText}</td>
    `;

    el.dashboardBody.appendChild(row);
  });
}

function renderTrendChart(data) {
  const canvas = el.trendChart;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.clientWidth;
  canvas.width = width * window.devicePixelRatio;
  canvas.height = 260 * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  ctx.clearRect(0, 0, width, 260);
  ctx.fillStyle = 'rgba(15, 24, 51, 0.8)';
  ctx.fillRect(0, 0, width, 260);

  const padding = 32;
  const stepX = (width - padding * 2) / Math.max(data.length - 1, 1);

  ctx.strokeStyle = 'rgba(126, 146, 224, 0.3)';
  for (let i = 0; i <= 4; i += 1) {
    const y = padding + ((260 - padding * 2) / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  const yPoint = (value) => {
    return 260 - padding - ((value - 50) / 50) * (260 - padding * 2);
  };

  ctx.beginPath();
  ctx.strokeStyle = '#7cd3ff';
  ctx.lineWidth = 2;

  data.forEach((item, idx) => {
    const x = padding + stepX * idx;
    const y = yPoint(item.current);
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  data.forEach((item, idx) => {
    const x = padding + stepX * idx;
    const y = yPoint(item.current);

    ctx.fillStyle = '#90a8ff';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#dce4ff';
    ctx.font = '12px Inter';
    ctx.fillText(`${item.current}%`, x - 16, y - 10);
    ctx.fillStyle = '#94a3d6';
    ctx.fillText(item.name.split(' ')[0], x - 20, 248);
  });
}

function renderFilters() {
  Object.entries(filterValues).forEach(([id, values]) => {
    const select = document.getElementById(`${id}Filter`);
    if (select.options.length) return;

    values.forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });

    select.value = state.filters[id];
    select.addEventListener('change', (event) => {
      state.filters[id] = event.target.value;
      renderAll();
    });
  });
}

function mountPlaybook() {
  if (el.playbookItems.childElementCount > 0) return;

  playbook.forEach((item, index) => {
    const article = document.createElement('article');
    article.className = `accordion-item ${index === 0 ? 'open' : ''}`;

    article.innerHTML = `
      <button class="accordion-header" type="button" aria-expanded="${index === 0}">${item.title}</button>
      <div class="accordion-body">
        <p><b>What to monitor:</b> ${item.monitor}</p>
        <p><b>Failure mode:</b> ${item.failure}</p>
        <p><b>Recommended mitigation:</b> ${item.mitigation}</p>
        <p><b>Escalation path:</b> ${item.escalation}</p>
      </div>
    `;

    const trigger = article.querySelector('.accordion-header');
    trigger.addEventListener('click', () => {
      const isOpen = article.classList.contains('open');
      article.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });

    el.playbookItems.appendChild(article);
  });
}

function initPrioritizationEngine() {
  const inputs = [el.impact, el.feasibility, el.urgency];

  const update = () => {
    const impact = Number(el.impact.value);
    const feasibility = Number(el.feasibility.value);
    const urgency = Number(el.urgency.value);

    el.impactValue.textContent = String(impact);
    el.feasibilityValue.textContent = String(feasibility);
    el.urgencyValue.textContent = String(urgency);

    const score = Math.round((impact * 0.5 + feasibility * 0.2 + urgency * 0.3) * 10);
    el.priorityValue.textContent = String(score);
    el.priorityLabel.textContent =
      score >= 75
        ? 'High-priority intervention recommended'
        : score >= 55
          ? 'Medium priority. Monitor closely and stage pilot intervention.'
          : 'Low priority. Keep tracking and re-evaluate next cycle.';
  };

  inputs.forEach((input) => input.addEventListener('input', update));
  update();
}

function resetAll() {
  state.filters = {
    market: 'Global',
    vehicle: 'All',
    cohort: 'All',
    time: 'All day'
  };

  ['market', 'vehicle', 'cohort', 'time'].forEach((id) => {
    document.getElementById(`${id}Filter`).value = state.filters[id];
  });

  el.impact.value = '8';
  el.feasibility.value = '6';
  el.urgency.value = '7';

  initPrioritizationEngine();
  renderAll();
}

function renderAll() {
  const computed = getComputedKpis();
  renderHeroMetrics(computed);
  renderKpiTree(computed);
  renderDashboard(computed);
  renderTrendChart(computed);
}

function initWebGLBackground() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('webgl-bg');
  const gl = canvas.getContext('webgl');
  if (!gl) return;

  const vertexShaderSource = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;
  const fragmentShaderSource = `
    precision mediump float;
    uniform vec2 resolution;
    uniform float time;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
      float t = time * 0.35;
      float ripple = sin((uv.x * uv.x + uv.y * uv.y) * 14.0 - t * 4.0);
      float waves = sin(uv.x * 7.0 + t) + cos(uv.y * 8.0 - t * 1.3);
      float stars = step(0.995, hash(floor((uv + t) * 80.0))) * 0.8;
      float glow = 0.18 / max(length(uv + vec2(sin(t), cos(t)) * 0.2), 0.08);

      vec3 base = vec3(0.04, 0.08, 0.16);
      vec3 accent = vec3(0.22, 0.35, 0.7) * waves * 0.18;
      vec3 color = base + accent + ripple * 0.04 + glow + vec3(stars);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexShaderSource));
  gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource));
  gl.linkProgram(program);
  gl.useProgram(program);

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, 'p');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const timeLocation = gl.getUniformLocation(program, 'time');
  const resolutionLocation = gl.getUniformLocation(program, 'resolution');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  window.addEventListener('resize', () => {
    resize();
    renderAll();
  });

  resize();

  function animate(timestamp) {
    gl.uniform1f(timeLocation, timestamp * 0.001);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    window.requestAnimationFrame(animate);
  }

  window.requestAnimationFrame(animate);
}

function init() {
  renderFilters();
  mountPlaybook();
  initPrioritizationEngine();
  renderAll();
  initWebGLBackground();

  el.resetAllBtn.addEventListener('click', resetAll);
  window.addEventListener('resize', () => renderTrendChart(getComputedKpis()));
}

init();
