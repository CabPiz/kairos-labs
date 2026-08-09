/**
 * Verifica cobertura de código nos arquivos modificados na branch atual.
 * Lê coverage/coverage-final.json e lista arquivos abaixo do threshold.
 * Uso: node scripts/check-coverage.mjs [--threshold=80]
 */
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, sep } from 'node:path';

const THRESHOLD = (() => {
  const arg = process.argv.find((a) => a.startsWith('--threshold='));
  return arg ? Number(arg.split('=')[1]) : 80;
})();

const COVERAGE_FILE = resolve('coverage/coverage-final.json');
const SONAR_EXCLUSIONS_FILE = resolve('sonar-project.properties');

// --- Arquivos excluídos do Sonar (não precisam de cobertura) ---
function getSonarExclusions() {
  if (!existsSync(SONAR_EXCLUSIONS_FILE)) return [];
  const content = readFileSync(SONAR_EXCLUSIONS_FILE, 'utf8');
  const line = content.split('\n').find((l) => l.startsWith('sonar.coverage.exclusions'));
  if (!line) return [];
  return line.split('=')[1].split(',').map((p) => p.trim());
}

function matchesGlob(filePath, pattern) {
  // Converte glob simples em regex (suporta ** e *)
  const escaped = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '§§')
    .replace(/\*/g, '[^/\\\\]*')
    .replace(/§§/g, '.*');
  return new RegExp(escaped).test(filePath.replace(/\\/g, '/'));
}

// --- Arquivos modificados na branch atual vs main ---
function getChangedFiles() {
  try {
    const out = execSync('git diff --name-only main...HEAD', { encoding: 'utf8' });
    return out.trim().split('\n').filter(Boolean);
  } catch {
    // Fallback: todos os arquivos staged
    const out = execSync('git diff --name-only --cached', { encoding: 'utf8' });
    return out.trim().split('\n').filter(Boolean);
  }
}

// --- Calcula % de cobertura de um arquivo no coverage-final.json ---
function computeCoverage(entry) {
  const counts = (obj) => {
    const total = Object.keys(obj).length;
    const covered = Object.values(obj).filter((v) => v > 0).length;
    return { total, covered };
  };

  const stmts = counts(entry.s ?? {});
  const fns = counts(entry.f ?? {});
  const branches = counts(entry.b ? Object.fromEntries(
    Object.entries(entry.b).flatMap(([k, arr]) =>
      arr.map((v, i) => [`${k}_${i}`, v])
    )
  ) : {});
  const lines = counts(entry.s ?? {}); // statements ≈ lines em istanbul

  const pct = (c) => (c.total === 0 ? 100 : Math.round((c.covered / c.total) * 100));

  return {
    statements: { pct: pct(stmts), covered: stmts.covered, total: stmts.total },
    functions:  { pct: pct(fns),   covered: fns.covered,   total: fns.total },
    branches:   { pct: pct(branches), covered: branches.covered, total: branches.total },
    lines:      { pct: pct(lines), covered: lines.covered,  total: lines.total },
    uncoveredLines: Object.entries(entry.s ?? {})
      .filter(([, v]) => v === 0)
      .map(([k]) => {
        // Mapeia statementId para linha via statementMap
        return entry.statementMap?.[k]?.start?.line ?? null;
      })
      .filter(Boolean)
      .sort((a, b) => a - b),
    uncoveredFunctions: Object.entries(entry.f ?? {})
      .filter(([, v]) => v === 0)
      .map(([k]) => {
        const loc = entry.fnMap?.[k];
        return loc ? `${loc.name ?? '(anônima)'} (linha ${loc.loc?.start?.line ?? '?'})` : null;
      })
      .filter(Boolean),
  };
}

// --- Main ---
if (!existsSync(COVERAGE_FILE)) {
  console.error('❌  coverage/coverage-final.json não encontrado. Rode "npm test -- --coverage" antes.');
  process.exit(1);
}

const coverageData = JSON.parse(readFileSync(COVERAGE_FILE, 'utf8'));
const changedFiles = getChangedFiles();
const exclusions = getSonarExclusions();

if (changedFiles.length === 0) {
  console.log('ℹ️  Nenhum arquivo modificado em relação à main.');
  process.exit(0);
}

const root = resolve('.').replace(/\\/g, '/') + '/';

const gaps = [];

for (const [absPath, entry] of Object.entries(coverageData)) {
  const relPath = absPath.replace(/\\/g, '/').replace(root, '');

  // Checar se o arquivo foi modificado nesta branch
  const wasChanged = changedFiles.some((f) => relPath.endsWith(f.replace(/\\/g, '/')));
  if (!wasChanged) continue;

  // Checar se está excluído do Sonar
  const isExcluded = exclusions.some((pat) => matchesGlob(relPath, pat));
  if (isExcluded) continue;

  const cov = computeCoverage(entry);
  const minPct = Math.min(cov.statements.pct, cov.functions.pct, cov.branches.pct, cov.lines.pct);

  if (minPct < THRESHOLD) {
    gaps.push({ relPath, cov, minPct });
  }
}

if (gaps.length === 0) {
  console.log(`✅  Cobertura OK — todos os arquivos modificados estão acima de ${THRESHOLD}%.`);
  process.exit(0);
}

console.log(`\n⚠️  COVERAGE GAPS DETECTADOS (threshold: ${THRESHOLD}%)\n`);
console.log('Corrija estes arquivos ANTES de commitar:\n');

for (const { relPath, cov } of gaps) {
  console.log(`📄  ${relPath}`);
  console.log(`    Statements: ${cov.statements.pct}%  |  Functions: ${cov.functions.pct}%  |  Branches: ${cov.branches.pct}%  |  Lines: ${cov.lines.pct}%`);
  if (cov.uncoveredLines.length > 0) {
    console.log(`    Linhas sem cobertura: ${cov.uncoveredLines.join(', ')}`);
  }
  if (cov.uncoveredFunctions.length > 0) {
    console.log(`    Funções sem cobertura: ${cov.uncoveredFunctions.join('; ')}`);
  }
  console.log();
}

console.log('📚  Consulte COVERAGE_GAPS.md para padrões conhecidos e soluções.\n');
process.exit(1);
