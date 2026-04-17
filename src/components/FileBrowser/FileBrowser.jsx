import { useState, useMemo, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, FileCode, File, Folder, FolderOpen, ChevronRight, PackageOpen } from 'lucide-react';
import './FileBrowser.css';

// ── Helpers ────────────────────────────────────────────────────────────────

function parseSkillFiles(body) {
  if (!body) return { dirs: [] };
  const allPaths = new Set();

  // backtick-quoted paths:  `dir/file.ext`
  const btRe = /`([a-zA-Z0-9_\-.]+(?:\/[a-zA-Z0-9_\-.]+)+\.[\w]{1,10})`/g;
  let m;
  while ((m = btRe.exec(body)) !== null) allPaths.add(m[1]);

  // script invocations:  python scripts/foo.py  /  node scripts/bar.js
  const cmdRe = /(?:python3?|node|bash|sh)\s+([\w./\-]+\.(?:py|js|ts|mjs|sh))/g;
  while ((m = cmdRe.exec(body)) !== null) allPaths.add(m[1]);

  // ./relative paths
  const relRe = /\.\/([\w./\-]+\.[\w]{1,10})/g;
  while ((m = relRe.exec(body)) !== null) allPaths.add(m[1]);

  // Build dir → [files] map
  const dirMap = {};
  allPaths.forEach(p => {
    const parts = p.split('/');
    if (parts.length >= 2) {
      const dir = parts.slice(0, -1).join('/');
      const file = parts[parts.length - 1];
      if (!dirMap[dir]) dirMap[dir] = new Set();
      dirMap[dir].add(file);
    }
  });

  const dirs = Object.entries(dirMap)
    .map(([name, files]) => ({ name, files: Array.from(files).sort() }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { dirs };
}

function getExcerpt(body, filePath) {
  if (!body) return null;
  const fileName = filePath.split('/').pop();
  const lines = body.split('\n');
  const chunks = [];

  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].includes(fileName) && !lines[i].includes(filePath)) continue;

    // Find nearest heading above this line
    let headStart = i;
    for (let j = i - 1; j >= 0; j--) {
      if (/^#{1,3} /.test(lines[j])) { headStart = j; break; }
    }
    // Collect to end of section (next same-level heading or 25 lines)
    let end = Math.min(lines.length - 1, i + 24);
    const headLevel = (lines[headStart].match(/^(#{1,3}) /) || ['', ''])[1].length;
    for (let j = i + 1; j <= end; j++) {
      const lvl = (lines[j].match(/^(#{1,3}) /) || ['', ''])[1].length;
      if (lvl > 0 && lvl <= headLevel && j > i + 2) { end = j - 1; break; }
    }

    const chunk = lines.slice(headStart, end + 1).join('\n').trim();
    if (!chunks.some(c => c === chunk)) chunks.push(chunk);
  }

  return chunks.length ? chunks.join('\n\n---\n\n') : null;
}

function FileIcon({ ext, size = 13 }) {
  const colorMap = {
    py: '#3b82f6', js: '#f59e0b', ts: '#3b82f6', mjs: '#f59e0b',
    jsx: '#61dafb', tsx: '#61dafb', sh: '#8b5cf6', bash: '#8b5cf6',
    json: '#f97316', yaml: '#ec4899', yml: '#ec4899',
    md: '#10b981', txt: '#10b981',
  };
  const color = colorMap[ext] || 'var(--color-text-muted)';
  if (['md', 'txt'].includes(ext)) return <FileText size={size} color={color} />;
  if (['py', 'js', 'ts', 'mjs', 'jsx', 'tsx', 'sh', 'bash'].includes(ext)) return <FileCode size={size} color={color} />;
  return <File size={size} color={color} />;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function FileBrowser({ skill }) {
  const { dirs } = useMemo(() => parseSkillFiles(skill.body), [skill.body]);
  const allDirNames = useMemo(() => dirs.map(d => d.name), [dirs]);
  const [selected, setSelected] = useState('SKILL.md');
  const [expanded, setExpanded] = useState(() => new Set(allDirNames));
  const [treeWidth, setTreeWidth] = useState(220);
  const browserRef = useRef(null);
  const dragging = useRef(false);

  const toggleDir = name =>
    setExpanded(prev => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n; });

  const onDragStart = useCallback(e => {
    e.preventDefault();
    dragging.current = true;
    const onMove = mv => {
      if (!dragging.current || !browserRef.current) return;
      const rect = browserRef.current.getBoundingClientRect();
      const newW = Math.min(400, Math.max(140, mv.clientX - rect.left));
      setTreeWidth(newW);
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);

  const ext = selected.split('.').pop().toLowerCase();
  const isRoot = selected === 'SKILL.md';

  const excerpt = useMemo(
    () => isRoot ? null : getExcerpt(skill.body, selected),
    [selected, skill.body, isRoot]
  );

  return (
    <div className="file-browser" ref={browserRef} style={{ gridTemplateColumns: `${treeWidth}px 4px 1fr` }}>
      {/* ── Tree ── */}
      <div className="file-tree">
        <button
          className={`file-tree__item ${isRoot ? 'file-tree__item--active' : ''}`}
          onClick={() => setSelected('SKILL.md')}
        >
          <FileIcon ext="md" size={13} />
          <span>SKILL.md</span>
        </button>

        {dirs.map(dir => (
          <div key={dir.name} className="file-tree__group">
            <button className="file-tree__dir" onClick={() => toggleDir(dir.name)}>
              {expanded.has(dir.name)
                ? <FolderOpen size={13} color="var(--color-primary)" />
                : <Folder size={13} color="var(--color-text-muted)" />}
              <span>{dir.name}</span>
              <ChevronRight
                size={11}
                className={`file-tree__chevron ${expanded.has(dir.name) ? 'file-tree__chevron--open' : ''}`}
              />
            </button>
            {expanded.has(dir.name) && (
              <div className="file-tree__children">
                {dir.files.map(f => {
                  const path = `${dir.name}/${f}`;
                  const fExt = f.split('.').pop().toLowerCase();
                  return (
                    <button
                      key={f}
                      className={`file-tree__item file-tree__item--child ${selected === path ? 'file-tree__item--active' : ''}`}
                      onClick={() => setSelected(path)}
                    >
                      <FileIcon ext={fExt} size={13} />
                      <span>{f}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {dirs.length === 0 && (
          <p className="file-tree__empty">No additional files referenced</p>
        )}
      </div>

      {/* ── Resize handle ── */}
      <div className="file-browser__divider" onMouseDown={onDragStart} />

      {/* ── Viewer ── */}
      <div className="file-viewer">
        <div className="file-viewer__header">
          <FileIcon ext={ext} size={13} />
          <span className="file-viewer__path">{selected}</span>
          {!isRoot && <span className="file-viewer__badge">referenced</span>}
        </div>

        <div className="file-viewer__body">
          {isRoot ? (
            <div className="markdown-body">
              <ReactMarkdown>{skill.body}</ReactMarkdown>
            </div>
          ) : excerpt ? (
            <div className="file-viewer__excerpt">
              <div className="file-viewer__excerpt-note">
                Showing referenced sections from SKILL.md · Install to access full file
              </div>
              <div className="markdown-body">
                <ReactMarkdown>{excerpt}</ReactMarkdown>
              </div>
              <div className="file-viewer__install-note">
                <code>claude skills add {skill.owner}/{skill.slug}</code>
              </div>
            </div>
          ) : (
            <div className="file-viewer__empty">
              <PackageOpen size={36} strokeWidth={1.5} />
              <p className="file-viewer__empty-name">{selected}</p>
              <p>This file is part of the skill package.</p>
              <code>claude skills add {skill.owner}/{skill.slug}</code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
