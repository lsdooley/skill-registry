#!/usr/bin/env node
// generate-prompts.js — converts ea-agentic-skills-repository SKILL.md files
// into Copilot Lite prompts and writes public/skills-manifest.json

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const matter = require('gray-matter');

const REPO_PATH   = join(process.env.HOME, 'projects/ea-agentic-skills-repository/skills');
const PUBLIC_DIR  = new URL('../public', import.meta.url).pathname;
const PROMPTS_DIR = join(PUBLIC_DIR, 'prompts');
const MANIFEST    = join(PUBLIC_DIR, 'skills-manifest.json');

// ── Helpers ────────────────────────────────────────────────────────────────

function titleCase(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function parseCategoryName(readmeText, dirName) {
  const m = readmeText.match(/^#\s+\d+\s+[·•]\s+(.+)$/m);
  if (m) return m[1].trim();
  return titleCase(dirName.replace(/^\d+-/, ''));
}

function parseReadmeTable(readmeText) {
  const rows = [];
  const lines = readmeText.split('\n');
  let inTable = false;
  for (const line of lines) {
    if (/^\|\s*Skill\s*\|/i.test(line))   { inTable = true; continue; }
    if (inTable && /^\|---/.test(line))    { continue; }
    if (inTable && line.startsWith('|')) {
      const cols = line.split('|').map(c => c.trim()).filter((_, i) => i > 0 && i < 6);
      if (cols.length >= 4) {
        const [slug, eaFit, bankingFit, source, star] = cols;
        if (slug && /^[a-z]/.test(slug)) {
          rows.push({
            slug,
            eaFit:      parseInt(eaFit, 10)      || 0,
            bankingFit: parseInt(bankingFit, 10) || 0,
            source:     source || '',
            featured:   (star || '').includes('★'),
          });
        }
      }
    } else if (inTable && !line.startsWith('|')) {
      inTable = false;
    }
  }
  return rows;
}

// Smart-transform SKILL.md body into a Copilot Lite–friendly prompt
function smartTransform(body, slug, description) {
  const title = titleCase(slug);
  let text = body;

  // 1. Strip XML / Claude-specific tags
  text = text.replace(/<\/?(?:tool|function_calls?|parameters?|result|antml:[^>]*)>[^\n]*/gi, '');

  // 2. Remove bash blocks that are entirely Python script invocations
  text = text.replace(/```bash\n([\s\S]*?)```/g, (match, content) => {
    const lines = content.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
    if (lines.length === 0) return '';
    const allPythonScript = lines.every(l => /^\s*python\s+scripts\//.test(l));
    if (allPythonScript) return '';
    // Partial: keep block but strip python scripts/ lines
    const filtered = content
      .split('\n')
      .filter(l => !/^\s*python\s+scripts\//.test(l))
      .join('\n')
      .trim();
    return filtered ? '```bash\n' + filtered + '\n```' : '';
  });

  // 3. Collapse 3+ blank lines → 2
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  // 4. Build Copilot preamble
  const preamble = [
    `# ${title} — Copilot Expert Prompt`,
    ``,
    `> **How to use in Copilot:** Copy everything below the divider and paste it`,
    `> into a new Copilot chat. This activates expert mode for your session.`,
    ``,
    `---`,
    ``,
    `You are a ${title} expert. ${description}`,
    ``,
  ].join('\n');

  return preamble + text;
}

// ── Phase 1: Parse category READMEs ────────────────────────────────────────

const categoryDirs = readdirSync(REPO_PATH, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort();

const categories = [];
const readmeMap  = {};   // key: "catDir/skillSlug" → scoring data

for (const catDir of categoryDirs) {
  const readmePath = join(REPO_PATH, catDir, 'README.md');
  if (!existsSync(readmePath)) continue;
  const text    = readFileSync(readmePath, 'utf8');
  const catName = parseCategoryName(text, catDir);
  const rows    = parseReadmeTable(text);

  for (const row of rows) {
    readmeMap[`${catDir}/${row.slug}`] = { ...row, categorySlug: catDir, categoryName: catName };
  }

  categories.push({ slug: catDir, name: catName, skills: [] });
}

// ── Phase 2: Parse SKILL.md files → write prompt files ─────────────────────

mkdirSync(PROMPTS_DIR, { recursive: true });

let written = 0;

for (const catDir of categoryDirs) {
  const catPath  = join(REPO_PATH, catDir);
  const skillDirs = readdirSync(catPath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  for (const skillDir of skillDirs) {
    const skillMdPath = join(catPath, skillDir, 'SKILL.md');
    if (!existsSync(skillMdPath)) continue;

    const raw    = readFileSync(skillMdPath, 'utf8');
    const parsed = matter(raw);
    const fm     = parsed.data;
    const body   = parsed.content.trim();

    const key  = `${catDir}/${skillDir}`;
    const meta = readmeMap[key] || {};

    const slug        = skillDir;
    const description = fm.description || '';
    const version     = fm.version     || '1.0.0';
    const risk        = fm.risk        || 'low';
    const eaFit       = meta.eaFit      || 0;
    const bankingFit  = meta.bankingFit || 0;
    const featured    = meta.featured   || false;
    const promptPath  = `/prompts/${catDir}/${slug}.md`;

    // Write converted prompt
    const promptDir = join(PROMPTS_DIR, catDir);
    mkdirSync(promptDir, { recursive: true });
    writeFileSync(
      join(promptDir, `${slug}.md`),
      smartTransform(body, slug, description),
      'utf8'
    );
    written++;

    // Register in manifest
    const cat = categories.find(c => c.slug === catDir);
    if (cat) {
      cat.skills.push({
        slug,
        title:       titleCase(slug),
        description,
        risk,
        eaFit,
        bankingFit,
        featured,
        version,
        promptPath,
        source: meta.source || '',
      });
    }
  }
}

// ── Phase 3: Write manifest ─────────────────────────────────────────────────

const manifest = {
  generated:  new Date().toISOString(),
  total:      written,
  categories: categories.filter(c => c.skills.length > 0),
};

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2), 'utf8');

console.log(`✓ ${written} Copilot prompts → public/prompts/`);
console.log(`✓ ${manifest.categories.length} categories`);
console.log(`✓ Manifest → public/skills-manifest.json`);
