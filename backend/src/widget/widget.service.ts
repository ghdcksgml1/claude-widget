import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

const SHOW_WIDGET_TOOL: Anthropic.Tool = {
  name: 'show_widget',
  description:
    'Show visual content — SVG graphics, diagrams, charts, or interactive HTML widgets — that renders inline alongside your text response.\n' +
    'Use for flowcharts, architecture diagrams, dashboards, forms, calculators, data tables, games, illustrations, or any visual content.\n' +
    'The code is auto-detected: starts with <svg = SVG mode, otherwise HTML mode.\n' +
    'A global sendPrompt(text) function is available — it sends a message to chat as if the user typed it.\n' +
    'IMPORTANT: Call read_me once before your first show_widget call, then set \'i_have_seen_read_me: true\'. Do NOT narrate or mention the read_me call to the user — call it silently, then respond as if you went straight to building the visualization.',
  input_schema: {
    type: 'object',
    properties: {
      i_have_seen_read_me: {
        type: 'boolean',
        description: 'Confirm whether you have already called read_me in this conversation.',
      },
      loading_messages: {
        type: 'array',
        items: { type: 'string' },
        description:
          '1–4 loading messages shown to the user while the visual renders, each roughly 5 words long. Write them in the same language the user is using.',
      },
      title: {
        type: 'string',
        description:
          'Short snake_case identifier for this visual. Must be specific and disambiguating.',
      },
      widget_code: {
        type: 'string',
        description:
          'SVG or HTML code to render. For SVG: raw SVG code starting with <svg> tag. For HTML: raw HTML content to render, do NOT include DOCTYPE, <html>, <head>, or <body> tags.',
      },
    },
    required: ['i_have_seen_read_me', 'loading_messages', 'title', 'widget_code'],
  },
};

export interface SseEvent {
  event: 'delta' | 'done' | 'error';
  data: string;
}

@Injectable()
export class WidgetService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async *streamWidget(prompt: string): AsyncGenerator<SseEvent> {
    const stream = this.anthropic.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
      tools: [SHOW_WIDGET_TOOL],
      tool_choice: { type: 'any' },
    });

    let accumulatedJson = '';
    let inToolUse = false;

    for await (const event of stream) {
      if (
        event.type === 'content_block_start' &&
        event.content_block.type === 'tool_use' &&
        event.content_block.name === 'show_widget'
      ) {
        inToolUse = true;
        accumulatedJson = '';
      }

      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'input_json_delta' &&
        inToolUse
      ) {
        const delta = event.delta.partial_json;
        accumulatedJson += delta;
        yield { event: 'delta', data: delta };
      }

      if (event.type === 'content_block_stop' && inToolUse) {
        inToolUse = false;
        yield { event: 'done', data: accumulatedJson };
      }
    }
  }
}
