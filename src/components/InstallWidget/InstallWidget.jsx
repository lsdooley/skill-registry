import { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import './InstallWidget.css';

export default function InstallWidget({ owner, slug, body }) {
  const [activeTab, setActiveTab] = useState('prompt');
  const [copied, setCopied] = useState(false);

  const promptText = body
    ? `Use the following skill to complete your task:\n\n${body}`
    : `Use the ${slug} skill to complete your task.`;
  const cliText = `./install.sh --individual ${slug}`;
  const currentText = activeTab === 'prompt' ? promptText : cliText;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="install-widget">
      <div className="install-widget__tabs">
        <button className={activeTab === 'prompt' ? 'active' : ''} onClick={() => setActiveTab('prompt')}>
          Give this prompt to your agent
        </button>
        <button className={activeTab === 'cli' ? 'active' : ''} onClick={() => setActiveTab('cli')}>
          <Terminal size={13} /> CLI command
        </button>
      </div>
      <div className="install-widget__body">
        <code className="install-widget__code">{currentText}</code>
        <button className="install-widget__copy" onClick={handleCopy} aria-label="Copy to clipboard">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : activeTab === 'prompt' ? 'Copy' : 'Copy CLI command'}
        </button>
      </div>
    </div>
  );
}
