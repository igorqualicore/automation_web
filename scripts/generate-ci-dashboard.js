const fs = require('fs');
const path = require('path');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDuration(durationMs) {
  const totalSeconds = Math.round((durationMs || 0) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return minutes ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readLogPreview(logPath) {
  if (!fs.existsSync(logPath)) {
    return 'Log nao disponivel.';
  }

  return fs.readFileSync(logPath, 'utf8')
    .split(/\r?\n/)
    .slice(-25)
    .join('\n')
    .trim() || 'Log vazio.';
}

function collectArtifacts(inputDir, outputDir) {
  if (!fs.existsSync(inputDir)) {
    return [];
  }

  const runsDir = path.join(outputDir, 'runs');
  fs.mkdirSync(runsDir, { recursive: true });

  return fs.readdirSync(inputDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const sourceDir = path.join(inputDir, entry.name);
      const destinationDir = path.join(runsDir, entry.name);

      fs.cpSync(sourceDir, destinationDir, { recursive: true });

      const metadata = readJsonIfExists(path.join(destinationDir, 'ci-metadata.json'));
      const reportPath = path.join(destinationDir, 'html', 'execution-report.html');
      const logPath = path.join(destinationDir, 'logs', 'terminal.log');

      return {
        artifactName: entry.name,
        environment: metadata?.environment || entry.name.replace('cypress-artifacts-', ''),
        status: metadata?.status || 'unknown',
        browserName: metadata?.browserName || 'unknown',
        browserVersion: metadata?.browserVersion || 'unknown',
        duration: metadata?.totalDuration || 0,
        totalTests: metadata?.totalTests || 0,
        totalPassed: metadata?.totalPassed || 0,
        totalFailed: metadata?.totalFailed || 0,
        totalPending: metadata?.totalPending || 0,
        totalSkipped: metadata?.totalSkipped || 0,
        screenshots: metadata?.screenshots || 0,
        runUrl: metadata?.runUrl || null,
        reportLink: fs.existsSync(reportPath)
          ? `runs/${entry.name}/html/execution-report.html`
          : null,
        logLink: fs.existsSync(logPath)
          ? `runs/${entry.name}/logs/terminal.log`
          : null,
        logPreview: readLogPreview(logPath),
      };
    })
    .sort((left, right) => left.environment.localeCompare(right.environment));
}

function buildHtml(runs) {
  const passedCount = runs.filter((run) => run.status === 'passed').length;
  const failedCount = runs.filter((run) => run.status === 'failed').length;
  const unknownCount = runs.filter((run) => run.status === 'unknown').length;
  const totalDuration = runs.reduce((sum, run) => sum + run.duration, 0);
  const totalTests = runs.reduce((sum, run) => sum + run.totalTests, 0);
  const totalPassed = runs.reduce((sum, run) => sum + run.totalPassed, 0);
  const totalFailed = runs.reduce((sum, run) => sum + run.totalFailed, 0);
  const approvalRate = totalTests ? Math.round((totalPassed / totalTests) * 100) : 0;
  const overallStatus = failedCount > 0 ? 'critical' : unknownCount > 0 ? 'warning' : 'healthy';
  const overallLabel = overallStatus === 'critical'
    ? 'Atenção imediata'
    : overallStatus === 'warning'
      ? 'Execução parcial'
      : 'Execução saudável';
  const failedRatio = runs.length ? (failedCount / runs.length) * 100 : 0;
  const passedRatio = runs.length ? (passedCount / runs.length) * 100 : 0;
  const unknownRatio = runs.length ? (unknownCount / runs.length) * 100 : 0;

  const cards = runs.map((run) => {
    const badgeClass = run.status === 'passed' ? 'passed' : run.status === 'failed' ? 'failed' : 'unknown';
    const statusLabel = run.status === 'passed' ? 'Passou' : run.status === 'failed' ? 'Falhou' : 'Sem dados';
    const severityClass = run.totalFailed > 0 ? 'critical' : run.totalPending > 0 || run.totalSkipped > 0 ? 'warning' : 'healthy';

    return `
      <section class="card ${severityClass}">
        <div class="card-header">
          <div>
            <p class="eyebrow">Ambiente</p>
            <h2>${escapeHtml(run.environment)}</h2>
            <p class="subhead">${escapeHtml(`${run.browserName} ${run.browserVersion}`)}</p>
          </div>
          <span class="badge ${badgeClass}">${statusLabel}</span>
        </div>

        <div class="severity severity-${severityClass}">
          <span class="severity-dot"></span>
          <strong>${run.totalFailed > 0 ? 'Severidade alta' : run.totalPending > 0 || run.totalSkipped > 0 ? 'Severidade moderada' : 'Sem desvios'}</strong>
        </div>

        <div class="metrics">
          <div><span>Duração</span><strong>${escapeHtml(formatDuration(run.duration))}</strong></div>
          <div><span>Testes</span><strong>${escapeHtml(String(run.totalTests))}</strong></div>
          <div><span>Aprovados</span><strong>${escapeHtml(String(run.totalPassed))}</strong></div>
          <div><span>Falhos</span><strong>${escapeHtml(String(run.totalFailed))}</strong></div>
          <div><span>Screenshots</span><strong>${escapeHtml(String(run.screenshots))}</strong></div>
        </div>

        <div class="log-block">
          <p class="log-title">Últimas linhas do log</p>
          <pre>${escapeHtml(run.logPreview)}</pre>
        </div>
      </section>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dashboard CI Cypress</title>
  <style>
    :root {
      --bg: #f4efe8;
      --panel: #fffdf9;
      --panel-strong: #fff8ef;
      --text: #1f2937;
      --muted: #6b7280;
      --border: #e8dccd;
      --accent: #0f766e;
      --accent-2: #d97706;
      --healthy: #166534;
      --healthy-bg: #dcfce7;
      --danger: #b42318;
      --danger-bg: #fee4e2;
      --warning: #b54708;
      --warning-bg: #fef0c7;
      --shadow: 0 18px 50px rgba(58, 43, 24, 0.08);
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", "Trebuchet MS", sans-serif;
      background: linear-gradient(180deg, #f8f4ee 0%, #f1e8db 100%);
      color: var(--text);
    }

    .page {
      max-width: 1280px;
      margin: 0 auto;
      padding: 32px 20px 56px;
    }

    .hero {
      background: radial-gradient(circle at top left, #fff7ed 0%, #fffdf9 38%, #f6efe5 100%);
      border: 1px solid var(--border);
      border-radius: 28px;
      box-shadow: var(--shadow);
      padding: 28px;
      margin-bottom: 24px;
    }

    .hero h1 {
      margin: 0 0 10px;
      font-size: 2rem;
      letter-spacing: -0.03em;
    }

    .hero p {
      margin: 0;
      color: var(--muted);
      max-width: 760px;
      line-height: 1.5;
    }

    .hero-top {
      display: flex;
      justify-content: space-between;
      gap: 18px;
      align-items: flex-start;
    }

    .health-pill {
      min-width: 220px;
      border-radius: 22px;
      padding: 18px;
      border: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.8);
    }

    .health-pill.healthy { background: linear-gradient(135deg, #effdf5 0%, #dcfce7 100%); }
    .health-pill.warning { background: linear-gradient(135deg, #fff8e8 0%, #fef0c7 100%); }
    .health-pill.critical { background: linear-gradient(135deg, #fff1f0 0%, #fee4e2 100%); }

    .health-pill span {
      display: block;
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted);
    }

    .health-pill strong {
      display: block;
      margin-top: 8px;
      font-size: 1.5rem;
    }

    .health-pill small {
      display: block;
      margin-top: 8px;
      color: #51463b;
      font-size: 0.92rem;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 14px;
      margin-top: 24px;
    }

    .summary-card.highlight {
      background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
      color: #f8fafc;
    }

    .summary-card.highlight span,
    .summary-card.highlight strong {
      color: #f8fafc;
    }

    .severity-bar {
      display: flex;
      width: 100%;
      height: 14px;
      overflow: hidden;
      border-radius: 999px;
      background: #eadfce;
      margin-top: 18px;
    }

    .severity-bar div { height: 100%; }
    .severity-bar .passed-segment { background: linear-gradient(90deg, #22c55e 0%, #15803d 100%); }
    .severity-bar .failed-segment { background: linear-gradient(90deg, #ef4444 0%, #b42318 100%); }
    .severity-bar .unknown-segment { background: linear-gradient(90deg, #f59e0b 0%, #b54708 100%); }

    .severity-caption {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 10px;
      color: var(--muted);
      font-size: 0.92rem;
    }

    .summary-card,
    .card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 22px;
      box-shadow: var(--shadow);
    }

    .summary-card { padding: 18px; }
    .summary-card span,
    .metrics span,
    .eyebrow,
    .log-title {
      display: block;
      color: var(--muted);
      font-size: 0.84rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .summary-card strong {
      display: block;
      margin-top: 10px;
      font-size: 1.7rem;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 18px;
    }

    .card {
      padding: 22px;
      position: relative;
      overflow: hidden;
    }

    .card::before {
      content: "";
      position: absolute;
      inset: 0 auto 0 0;
      width: 6px;
      background: #d6c2ab;
    }

    .card.healthy::before { background: linear-gradient(180deg, #22c55e 0%, #166534 100%); }
    .card.warning::before { background: linear-gradient(180deg, #f59e0b 0%, #b54708 100%); }
    .card.critical::before { background: linear-gradient(180deg, #ef4444 0%, #b42318 100%); }

    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 18px;
    }

    .card h2 {
      margin: 4px 0 0;
      font-size: 1.5rem;
    }

    .subhead {
      margin: 6px 0 0;
      color: var(--muted);
      font-size: 0.96rem;
    }

    .badge {
      border-radius: 999px;
      padding: 8px 12px;
      font-weight: 700;
      font-size: 0.9rem;
      white-space: nowrap;
    }

    .badge.passed { background: #dcfce7; color: #166534; }
    .badge.failed { background: #fee4e2; color: var(--danger); }
    .badge.unknown { background: #fef0c7; color: var(--warning); }

    .severity {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 999px;
      margin-bottom: 16px;
      font-size: 0.92rem;
    }

    .severity-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: currentColor;
    }

    .severity-healthy { background: var(--healthy-bg); color: var(--healthy); }
    .severity-warning { background: var(--warning-bg); color: var(--warning); }
    .severity-critical { background: var(--danger-bg); color: var(--danger); }

    .metrics {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 18px;
    }

    .metrics div {
      background: #fcf8f2;
      border-radius: 16px;
      padding: 12px;
      border: 1px solid #efe3d3;
    }

    .metrics strong {
      display: block;
      margin-top: 6px;
      font-size: 1.05rem;
    }

    .links {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 18px;
    }

    .button {
      text-decoration: none;
      background: var(--accent);
      color: white;
      padding: 10px 14px;
      border-radius: 999px;
      font-weight: 700;
    }

    .button.secondary { background: #0f172a; }
    .button.ghost { background: #eadfce; color: #3b2f25; }

    .log-block pre {
      margin: 10px 0 0;
      padding: 14px;
      border-radius: 16px;
      background: #201a17;
      color: #f9fafb;
      overflow: auto;
      min-height: 180px;
      font-size: 0.82rem;
      line-height: 1.45;
    }

    .empty {
      padding: 24px;
      text-align: center;
      border: 1px dashed var(--border);
      border-radius: 18px;
      color: var(--muted);
      background: rgba(255, 255, 255, 0.7);
    }

    @media (max-width: 720px) {
      .page { padding: 18px 14px 36px; }
      .hero, .card { padding: 18px; }
      .hero-top { flex-direction: column; }
      .health-pill { width: 100%; }
      .metrics { grid-template-columns: 1fr; }
      .card-header { flex-direction: column; }
    }
  </style>
</head>
<body>
  <main class="page">
    <section class="hero">
      <div class="hero-top">
        <div>
          <h1>Dashboard de Execução Cypress</h1>
          <p>Visão consolidada da pipeline com os três ambientes. Cada card mostra status final, duração, volume de testes, screenshots de falha e os logs mais recentes da execução.</p>
        </div>
        <aside class="health-pill ${overallStatus}">
          <span>Status geral</span>
          <strong>${overallLabel}</strong>
              <small>${approvalRate}% de aprovação sobre ${totalTests} testes executados.</small>
        </aside>
      </div>

      <div class="summary">
            <div class="summary-card highlight"><span>Aprovação geral</span><strong>${approvalRate}%</strong></div>
        <div class="summary-card"><span>Ambientes</span><strong>${runs.length}</strong></div>
        <div class="summary-card"><span>Passaram</span><strong>${passedCount}</strong></div>
        <div class="summary-card"><span>Falharam</span><strong>${failedCount}</strong></div>
            <div class="summary-card"><span>Duração total</span><strong>${escapeHtml(formatDuration(totalDuration))}</strong></div>
      </div>

          <div class="severity-bar" aria-label="Distribuição por status">
        <div class="passed-segment" style="width:${passedRatio}%"></div>
        <div class="failed-segment" style="width:${failedRatio}%"></div>
        <div class="unknown-segment" style="width:${unknownRatio}%"></div>
      </div>

      <div class="severity-caption">
            <span>${passedCount} ambiente(s) aprovado(s)</span>
        <span>${failedCount} ambiente(s) com falha</span>
        <span>${unknownCount} ambiente(s) sem dados</span>
      </div>
    </section>

        ${runs.length ? `<section class="grid">${cards}</section>` : '<div class="empty">Nenhum artefato de execução foi encontrado para montar o dashboard.</div>'}
  </main>
</body>
</html>`;
}

const inputDir = process.argv[2];
const outputDir = process.argv[3];

if (!inputDir || !outputDir) {
  process.stderr.write('Uso: node scripts/generate-ci-dashboard.js <inputDir> <outputDir>\n');
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });

const runs = collectArtifacts(inputDir, outputDir);
const dashboardHtml = buildHtml(runs);

fs.writeFileSync(path.join(outputDir, 'index.html'), dashboardHtml);