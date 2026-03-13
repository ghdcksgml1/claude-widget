import { ChatInput } from './components/ChatInput';
import { LoadingDisplay } from './components/LoadingDisplay';
import { WidgetRenderer } from './components/WidgetRenderer';
import { useWidgetStream } from './hooks/useWidgetStream';

export default function App() {
  const { state, submit, reset } = useWidgetStream();

  const isStreaming = state.status === 'streaming';
  const isComplete = state.status === 'complete';
  const isError = state.status === 'error';

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-sm">
            C
          </div>
          <h1 className="text-slate-100 font-semibold text-lg">Claude Widget</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-8">
        {/* Idle state: just show input */}
        {state.status === 'idle' && (
          <div className="w-full max-w-2xl flex flex-col items-center gap-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-100 mb-3">
                What should Claude visualize?
              </h2>
              <p className="text-slate-400 text-base">
                Describe a chart, diagram, dashboard, game, or any visual — Claude will build it.
              </p>
            </div>
            <ChatInput onSubmit={submit} disabled={false} />
          </div>
        )}

        {/* Streaming state: show loading messages */}
        {isStreaming && (
          <div className="w-full max-w-2xl flex flex-col items-center gap-4">
            <LoadingDisplay
              messages={
                state.loadingMessages.length > 0
                  ? state.loadingMessages
                  : ['Thinking...']
              }
            />
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="w-full max-w-2xl flex flex-col items-center gap-6">
            <div className="bg-red-950 border border-red-800 rounded-xl p-5 text-center">
              <p className="text-red-300 font-medium mb-1">Something went wrong</p>
              <p className="text-red-400 text-sm">{state.message}</p>
            </div>
            <button
              onClick={reset}
              className="bg-slate-700 hover:bg-slate-600 text-slate-100 text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* Complete state: show widget */}
        {isComplete && (
          <div className="w-full max-w-5xl flex flex-col gap-6">
            {/* Widget title */}
            <div className="flex items-center justify-between">
              <h2 className="text-slate-300 text-sm font-medium tracking-wide uppercase">
                {state.widget.title.replace(/_/g, ' ')}
              </h2>
              <button
                onClick={reset}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm px-4 py-1.5 rounded-lg transition-colors"
              >
                New widget
              </button>
            </div>

            {/* Widget */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden p-6">
              <WidgetRenderer
                widget={state.widget}
                onSendPrompt={submit}
              />
            </div>

            {/* New prompt input below */}
            <div className="mt-2">
              <ChatInput onSubmit={submit} disabled={false} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
