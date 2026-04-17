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

// ── Extract use-when sections → manifest ───────────────────────────────────

function extractUseSections(body) {
  function bullets(heading) {
    const re = new RegExp(
      '##\\s+' + heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\n([\\s\\S]*?)(?=\\n##\\s|\\n---\\s*\\n|$)',
      'i'
    );
    const m = body.match(re);
    if (!m) return [];
    return m[1]
      .split('\n')
      .map(l => l.replace(/^[-*]\s+/, '').trim())
      .filter(l => l.length > 0);
  }
  return {
    useWhen:     bullets('Use this skill when'),
    dontUseWhen: bullets('Do not use this skill when'),
  };
}

function stripUseSections(body) {
  return body
    .replace(/##\s+Use this skill when\s*\n[\s\S]*?(?=\n##\s|$)/i, '')
    .replace(/##\s+Do not use this skill when\s*\n[\s\S]*?(?=\n##\s|$)/i, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ── Smart transform: full Copilot Lite conversion ──────────────────────────

function removeSection(text, ...headings) {
  for (const h of headings) {
    const esc = h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text = text.replace(
      new RegExp(`\\n##\\s+${esc}[\\s\\S]*?(?=\\n##\\s|$)`, 'gi'),
      ''
    );
  }
  return text;
}

function cleanBashBlocks(text) {
  // Patterns that are pure automation invocations with no educational value
  const pureInvocationLine = l => {
    const t = l.trim();
    if (!t || t.startsWith('#')) return false;
    return (
      /^python\s+scripts\//.test(t)         ||
      /^sam\s+(local|deploy|build|init)\b/.test(t) ||
      /^pip\s+install\b/.test(t)            ||
      /^npm\s+install\b/.test(t)            ||
      /^adr\s+(new|init|generate|link)\b/.test(t) ||
      /^terraform\s+(init|apply|plan)\b/.test(t)
    );
  };

  return text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, content) => {
    const lines = content.split('\n');
    const nonEmpty = lines.filter(l => l.trim() && !l.trim().startsWith('#'));

    // Drop entirely if every meaningful line is a pure invocation
    if (nonEmpty.length > 0 && nonEmpty.every(pureInvocationLine)) return '';

    // Partial: filter out pure invocation lines but keep educational content
    const filtered = lines.filter(l => !pureInvocationLine(l)).join('\n').trim();
    return filtered ? '```' + lang + '\n' + filtered + '\n```' : '';
  });
}

function voiceTransform(text) {
  return text
    // Skill/tool references → first-person
    .replace(/\bThis skill provides\b/g, 'I provide')
    .replace(/\bThis skill helps\b/g, 'I help')
    .replace(/\bThis skill will\b/g, 'I will')
    .replace(/\bThis skill can\b/g, 'I can')
    .replace(/\bThis skill\b/g, 'I')
    .replace(/\bthis skill\b/g, 'this guidance')
    .replace(/\bThe skill\b/g, 'I')
    .replace(/\bthe skill\b/g, 'this guidance')
    .replace(/\bThis tool provides\b/g, 'I provide')
    .replace(/\bThis tool will\b/g, 'I will')
    .replace(/\bThis tool\b/g, 'I')
    .replace(/\bthe tool\b/g, 'this approach')
    // Invocation language → guidance language
    .replace(/\bInvoke this\b/gi, 'Use this')
    .replace(/\bTrigger this\b/gi, 'Use this')
    .replace(/\bRun this skill\b/gi, 'Use this guidance')
    // "Use this skill" → softer
    .replace(/\bUse this skill when\b/gi, 'Use this guidance when')
    .replace(/\bUse this skill\b/gi, 'Use this guidance');
}

function renameSections(text) {
  // Normalize variations → consistent names
  return text
    .replace(/^##\s+(Tools\s+Overview|Tools)\s*$/gm,           '## Capabilities')
    .replace(/^##\s+Core\s+Capabilities\s*$/gm,                '## Capabilities')
    .replace(/^##\s+What\s+It\s+Does\s*$/gm,                   '## Overview')
    .replace(/^##\s+What\s+This\s+Skill\s+Does\s*$/gm,         '## Overview')
    .replace(/^##\s+Safety\s*$/gm,                             '## Constraints & Guardrails')
    .replace(/^##\s+Instructions\s*$/gm,                       '## How I Work')
    .replace(/^##\s+Response\s+Approach\s*$/gm,                '## How I Work')
    .replace(/^##\s+Behavioral\s+Traits\s*$/gm,                '## How I Work')
    .replace(/^##\s+Example\s+Interactions\s*$/gm,             '## Example Interactions')
    .replace(/^##\s+Knowledge\s+Base\s*$/gm,                   '## Reference Knowledge')
    .replace(/^##\s+Reference\s+Documentation\s*$/gm,          '## Reference Knowledge')
    .replace(/^##\s+Reference\s+Files\s*$/gm,                  '## Reference Knowledge')
    .replace(/^##\s+Resources\s*$/gm,                          '## Reference Knowledge')
    .replace(/^##\s+Proactive\s+Triggers\s*$/gm,               '## When to Proactively Engage')
    .replace(/^##\s+Sharp\s+Edges\s*$/gm,                      '## Common Pitfalls & Sharp Edges');
}

function cleanInlineMetadata(text) {
  // Strip **Input:** / **Output:** / **Usage:** tool-invocation metadata lines.
  // These appear as **Label:** value OR **Label:** value — colon may be inside or outside bold markers.
  text = text.replace(/^\s*\*\*(Input|Output|Usage|Run|Execute):?\*\*:?\s*.*$/gm, '');

  // Convert **Solves:** "..." → a gentle blockquote callout
  text = text.replace(/^\*\*Solves:\*\*\s*"?(.+?)"?\s*$/gm, '> $1');
  text = text.replace(/^\*\*Solves:\*\*/gm, '>');

  // Strip "Load these files..." / "Use the following files..." instructions
  text = text.replace(/^Load (?:these files?|this file)\b.+$/gim, '');
  text = text.replace(/^Use the following files?\b.+$/gim, '');

  // Strip table rows that contain references/resources/scripts file paths (backtick or markdown link)
  text = text.replace(/^\|[^|]*`(?:references|resources|scripts)\/[^`]+`[^|]*\|.*$/gim, '');
  text = text.replace(/^\|[^|]*\[.*?\]\((?:references|resources|scripts)\/[^)]+\)[^|]*\|.*$/gim, '');

  // Strip list bullets that are purely markdown links to references/resources
  text = text.replace(/^\s*[-*]\s+\[.*?\]\((?:references|resources|scripts)\/[^)]+\)\s*$/gim, '');

  // Strip "See: [ref](ref)" / "See [text](references/...)" reference lines (any sentence starting with See + link)
  text = text.replace(/^\s*(?:\*\*)?(?:See|Refer to|Open|Reference)\*?\*?:?\s*\[.*?\]\((?:references|resources|scripts)\/[^)]+\).*$/gim, '');

  // Strip → See references/... arrow-reference lines
  text = text.replace(/^→\s+(?:See|Refer to|Open)\s+(?:references|resources|scripts)\/\S+.*$/gim, '');

  // Strip bullet items that are bold-wrapped reference paths: "- **references/file.md**: description"
  text = text.replace(/^\s*[-*]\s+\*\*(?:references|resources|scripts)\/[^*]+\*\*:.*$/gim, '');

  // Strip bare external file reference lines and bullets
  text = text.replace(/^\s*[-*]?\s*(?:See|Refer to|Load|Open)\s+`[^`]*(?:references|resources)\/[^`]*`.*$/gim, '');
  text = text.replace(/^\s*[-*]?\s*`(?:references|resources|scripts)\/[^`]+`\s*[-–—].*$/gim, '');

  // Strip bullet/numbered lines that are purely a label + references/ backtick path
  // e.g. "- Pattern Reference: `references/file.md` — description"
  text = text.replace(/^\s*[-*\d.]+\s+[^`\n]*`(?:references|resources|scripts)\/[^`]+`[^`\n]*$/gim, '');

  // For any remaining inline backtick references/ paths inside prose, strip just the path
  // Use [^`]* (0-or-more) to also catch bare `references/` directory mentions
  text = text.replace(/\s*`(?:references|resources|scripts)\/[^`]*`/gim, '');

  // Clean up trailing prepositions left by the above strip
  text = text.replace(/\b(in|from|see|at|via|using|against|to|for)\s*\./g, '.');
  text = text.replace(/\b(in|from|see|at|via|using|against|to|for)\s*,/g, ',');

  // Clean up "See the directory for..." and "See the  directory" artifacts from stripped backtick paths
  text = text.replace(/^See the\s+(?:directory|folder)\b.*$/gim, '');
  text = text.replace(/\bSee the\s+(?:directory|folder)\b[^.]*\./gim, '');

  // Strip lines that are just a bare relative filename/path
  text = text.replace(/^\s*[-*]\s+`\.\/[^`]+`\s*$/gm, '');

  // Remove table headers with no data rows (header + separator + blank/nothing)
  // These are left behind when all data rows are stripped.
  text = text.replace(/^\|[^\n]+\|\n\|[-| :]+\|\n(?!\|)/gm, '');

  return text;
}

function stripLeadingH1(text) {
  // The SKILL.md body starts with "# Title\n\nSubtitle" which repeats the title
  // from the preamble. Remove the first h1 (and its immediately following paragraph
  // if it duplicates the frontmatter description).
  return text.replace(/^#\s+[^\n]+\n(\n[^\n#][^\n]*\n)?/, '').trimStart();
}

function buildHowToUseMe(useWhen) {
  if (!useWhen || useWhen.length === 0) return '';
  const items = useWhen.slice(0, 6).map(w => {
    // Convert use-when bullets into action prompts
    const clean = w.replace(/^(you need to|you want to|you are|you're)\s+/i, '').trim();
    // Capitalize first letter
    return `- Ask me to help you ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;
  });
  return `## How to Use Me\n\n${items.join('\n')}\n`;
}

function smartTransform(body, slug, description, useWhen) {
  const title = titleCase(slug);

  // ── 0. Strip the leading h1 (duplicates the preamble title) ────────
  // Prepend \n so removeSection's \n## pattern matches even the first section.
  let text = '\n' + stripLeadingH1(body);

  // ── 1. Strip whole sections that don't belong in a Copilot prompt ──
  text = removeSection(text,
    'Table of Contents',
    'Quick Start',
    'Common Commands',
    'Installation',
    'Related Skills',
    'Delegation Triggers',
    'Cross-References',
    'Getting Help',
  );

  // ── 2. Clean up Claude-specific tags ───────────────────────────────
  text = text.replace(/<\/?(?:tool|function_calls?|parameters?|result|antml:[^>]*)>[^\n]*/gi, '');

  // ── 3. Clean bash / code blocks ────────────────────────────────────
  text = cleanBashBlocks(text);

  // ── 4. Clean inline metadata and file references ───────────────────
  text = cleanInlineMetadata(text);

  // ── 5. First-person voice transformation ───────────────────────────
  text = voiceTransform(text);

  // ── 6. Rename sections to Copilot-natural names ────────────────────
  text = renameSections(text);

  // ── 7. Collapse whitespace and remove empty sections ──────────────
  text = text.replace(/\n{3,}/g, '\n\n');
  // Remove ## headings whose only content is whitespace or a lone --- divider
  text = text.replace(/\n##[^\n]+\n(?:---\s*\n)?\n(?=##|---\s*\n|$)/g, '\n');
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  // ── 8. Build the "How to Use Me" section from use-when bullets ─────
  const howToUseMe = buildHowToUseMe(useWhen);

  // ── 9. Assemble final prompt ───────────────────────────────────────
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

  return preamble + (howToUseMe ? howToUseMe + '\n' : '') + text;
}

// ── Phase 1: Parse category READMEs ────────────────────────────────────────

const categoryDirs = readdirSync(REPO_PATH, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort();

const categories = [];
const readmeMap  = {};

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
  const catPath   = join(REPO_PATH, catDir);
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

    // Extract use-when data and strip from body
    const { useWhen, dontUseWhen } = extractUseSections(body);
    const cleanedBody = stripUseSections(body);

    // Write converted prompt
    const promptDir = join(PROMPTS_DIR, catDir);
    mkdirSync(promptDir, { recursive: true });
    writeFileSync(
      join(promptDir, `${slug}.md`),
      smartTransform(cleanedBody, slug, description, useWhen),
      'utf8'
    );
    written++;

    const cat = categories.find(c => c.slug === catDir);
    if (cat) {
      cat.skills.push({
        slug,
        title:        titleCase(slug),
        description,
        risk,
        eaFit,
        bankingFit,
        featured,
        version,
        promptPath,
        source:       meta.source || '',
        dependencies: fm.dependencies || 'None',
        dateAdded:    fm.date_added ? String(fm.date_added) : '',
        useWhen,
        dontUseWhen,
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
