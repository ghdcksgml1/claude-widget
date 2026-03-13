import { useEffect, useRef } from 'react';
import { ShowWidgetArgs } from '../hooks/useWidgetStream';

interface WidgetRendererProps {
  widget: ShowWidgetArgs;
  onSendPrompt?: (prompt: string) => void;
}

export function WidgetRenderer({ widget, onSendPrompt }: WidgetRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isSvg = widget.widget_code.trimStart().startsWith('<svg');

  // Listen for postMessage from iframe (sendPrompt support)
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'sendPrompt' && typeof e.data.text === 'string') {
        onSendPrompt?.(e.data.text);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onSendPrompt]);

  if (isSvg) {
    return (
      <div
        className="w-full flex justify-center items-start"
        dangerouslySetInnerHTML={{ __html: widget.widget_code }}
      />
    );
  }

  // HTML mode - inject sendPrompt bridge + CSS variables
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  :root {
    --bg: #0f172a;
    --surface: #1e293b;
    --border: #334155;
    --text: #f1f5f9;
    --muted: #94a3b8;
    --accent: #7c3aed;
    --accent-light: #a78bfa;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: transparent; color: var(--text); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
</style>
</head>
<body>
${widget.widget_code}
<script>
function sendPrompt(text) {
  window.parent.postMessage({ type: 'sendPrompt', text }, '*');
}
</script>
</body>
</html>`;

  return (
    <iframe
      ref={iframeRef}
      srcDoc={htmlContent}
      className="w-full rounded-xl border border-slate-700"
      style={{ minHeight: '400px', height: '600px' }}
      sandbox="allow-scripts allow-same-origin"
      title={widget.title}
    />
  );
}
