#!/usr/bin/env node
// generate-skills.js — reads ea-agentic-skills-repository, writes src/data/skills.js + authors.js
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const matter = require('gray-matter');

const REPO_PATH = join(process.env.HOME, 'projects/ea-agentic-skills-repository/skills');
const OUT_SKILLS = new URL('../src/data/skills.js', import.meta.url).pathname;
const OUT_AUTHORS = new URL('../src/data/authors.js', import.meta.url).pathname;

// --- Helpers ---

function titleCase(slug) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function extractH1(body) {
  if (!body) return null;
  const match = body.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function parseCategoryName(readmeText, dirName) {
  // Matches "# 01 · Architecture" or "# 02 · Security & Compliance"
  const match = readmeText.match(/^#\s+\d+\s+[·•]\s+(.+)$/m);
  if (match) return match[1].trim();
  // Fallback: title-case from dir (strip NN- prefix)
  return titleCase(dirName.replace(/^\d+-/, ''));
}

function parseReadmeTable(readmeText) {
  // Rows look like: | senior-architect | 95 | 90 | alirezarezvani | |
  //             or: | senior-architect | 95 | 90 | alirezarezvani | ★ |
  const rows = [];
  const lines = readmeText.split('\n');
  let inTable = false;
  for (const line of lines) {
    if (/^\|\s*Skill\s*\|/i.test(line)) { inTable = true; continue; }
    if (inTable && /^\|---/.test(line)) continue;
    if (inTable && line.startsWith('|')) {
      const cols = line.split('|').map(c => c.trim()).filter((_, i) => i > 0 && i < 6);
      if (cols.length >= 4) {
        const [slug, eaFit, bankingFit, source, star] = cols;
        if (slug && /^[a-z]/.test(slug)) {
          rows.push({
            slug,
            eaFit: parseInt(eaFit, 10) || 0,
            bankingFit: parseInt(bankingFit, 10) || 0,
            source: source || '',
            featured: (star || '').includes('★'),
          });
        }
      }
    } else if (inTable && !line.startsWith('|')) {
      inTable = false;
    }
  }
  return rows;
}

// --- Phase 1: Parse category READMEs ---

const categoryDirs = readdirSync(REPO_PATH, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort();

const CATEGORIES = [];
// readmeMap: categorySlug/slug -> { eaFit, bankingFit, source, featured }
const readmeMap = {};

for (const catDir of categoryDirs) {
  const readmePath = join(REPO_PATH, catDir, 'README.md');
  if (!existsSync(readmePath)) continue;
  const text = readFileSync(readmePath, 'utf8');
  const catName = parseCategoryName(text, catDir);
  const rows = parseReadmeTable(text);

  for (const row of rows) {
    readmeMap[`${catDir}/${row.slug}`] = { ...row, categorySlug: catDir, category: catName };
  }

  CATEGORIES.push({ slug: catDir, name: catName, skillCount: rows.length });
}

// --- Phase 2: Parse SKILL.md files ---

// skillMap: categorySlug/slug -> { frontmatter, body }
const skillMap = {};

for (const catDir of categoryDirs) {
  const catPath = join(REPO_PATH, catDir);
  const entries = readdirSync(catPath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const skillDir of entries) {
    const skillMdPath = join(catPath, skillDir, 'SKILL.md');
    if (!existsSync(skillMdPath)) continue;
    const raw = readFileSync(skillMdPath, 'utf8');
    const parsed = matter(raw);
    skillMap[`${catDir}/${skillDir}`] = {
      fm: parsed.data,
      body: parsed.content.trim(),
    };
  }
}

// --- Phase 3: Merge ---

const SKILLS = [];
let id = 1;

for (const [key, readmeData] of Object.entries(readmeMap)) {
  const { slug, eaFit, bankingFit, source, featured, categorySlug, category } = readmeData;
  const skillData = skillMap[key] || null;

  let title, summary, version, license, risk, dependencies, dateAdded, body, hasFullContent;

  if (skillData) {
    const { fm, body: rawBody } = skillData;
    title = titleCase(slug);
    summary = fm.description || '';
    version = fm.version || '1.0.0';
    license = fm.license || 'MIT';
    risk = fm.risk || 'low';
    dependencies = fm.dependencies || 'None';
    dateAdded = fm.date_added ? String(fm.date_added) : '2026-04-09';
    body = rawBody;
    hasFullContent = true;
  } else {
    title = titleCase(slug);
    summary = '';
    version = '1.0.0';
    license = 'MIT';
    risk = 'low';
    dependencies = 'None';
    dateAdded = '2026-04-09';
    body = null;
    hasFullContent = false;
  }

  SKILLS.push({
    id: String(id++),
    owner: 'lsdooley',
    slug,
    categorySlug,
    category,
    title,
    summary,
    version,
    license,
    risk,
    dependencies,
    dateAdded,
    featured,
    eaFit,
    bankingFit,
    source,
    tags: [category],
    body,
    hasFullContent,
    releases: [{ version, date: dateAdded, notes: 'Initial release' }],
    learnings: [],
  });
}

// --- Phase 4: Write output ---

const skillsJs = `// AUTO-GENERATED by scripts/generate-skills.js — do not edit manually
export const SKILLS = ${JSON.stringify(SKILLS, null, 2)};

export const CATEGORIES = ${JSON.stringify(CATEGORIES, null, 2)};
`;

const authorsJs = `// AUTO-GENERATED by scripts/generate-skills.js — do not edit manually
export const AUTHORS = [
  {
    id: '1',
    username: 'lsdooley',
    displayName: 'Larry Dooley',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=LD&backgroundColor=0d9488',
    bio: 'Enterprise architect building reusable AI agent skills for banking and financial services.',
    location: 'New York, NY',
    website: 'https://github.com/lsdooley',
    joinDate: '2026-04-09',
    verified: true,
  },
];
`;

writeFileSync(OUT_SKILLS, skillsJs, 'utf8');
writeFileSync(OUT_AUTHORS, authorsJs, 'utf8');

const withContent = SKILLS.filter(s => s.hasFullContent).length;
const featured = SKILLS.filter(s => s.featured).length;
console.log(`✓ ${SKILLS.length} skills (${withContent} with full content, ${SKILLS.length - withContent} table-only)`);
console.log(`✓ ${CATEGORIES.length} categories`);
console.log(`✓ ${featured} featured skills`);
console.log(`✓ Written to src/data/skills.js and src/data/authors.js`);
