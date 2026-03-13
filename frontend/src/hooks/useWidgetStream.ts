import { useState, useCallback } from 'react';

export interface ShowWidgetArgs {
  i_have_seen_read_me: boolean;
  loading_messages: string[];
  title: string;
  widget_code: string;
}

type StreamState =
  | { status: 'idle' }
  | { status: 'streaming'; loadingMessages: string[]; accumulated: string }
  | { status: 'complete'; widget: ShowWidgetArgs }
  | { status: 'error'; message: string };

function tryParseLoadingMessages(accumulated: string): string[] | null {
  // Try to extract loading_messages from partial JSON
  const match = accumulated.match(/"loading_messages"\s*:\s*(\[[^\]]*\])/);
  if (!match) return null;
  try {
    const arr = JSON.parse(match[1]);
    if (Array.isArray(arr) && arr.length > 0) return arr;
  } catch {
    // partial array, try to extract complete strings
    const strings: string[] = [];
    const strMatch = match[1].matchAll(/"((?:[^"\\]|\\.)*)"/g);
    for (const m of strMatch) {
      strings.push(m[1]);
    }
    return strings.length > 0 ? strings : null;
  }
  return null;
}

export function useWidgetStream() {
  const [state, setState] = useState<StreamState>({ status: 'idle' });

  const submit = useCallback(async (prompt: string) => {
    setState({ status: 'streaming', loadingMessages: [], accumulated: '' });

    try {
      const response = await fetch('http://localhost:3000/widget/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE messages from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        let currentEvent = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const rawData = line.slice(6);
            let parsed: string;
            try {
              parsed = JSON.parse(rawData);
            } catch {
              parsed = rawData;
            }

            if (currentEvent === 'delta') {
              accumulated += parsed;
              const loadingMessages = tryParseLoadingMessages(accumulated);
              setState({
                status: 'streaming',
                loadingMessages: loadingMessages ?? [],
                accumulated,
              });
            } else if (currentEvent === 'done') {
              const widget = JSON.parse(parsed) as ShowWidgetArgs;
              setState({ status: 'complete', widget });
            } else if (currentEvent === 'error') {
              setState({ status: 'error', message: parsed });
            }
            currentEvent = '';
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setState({ status: 'error', message });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  return { state, submit, reset };
}
