import { chat, toServerSentEventsResponse } from '@tanstack/ai';
import {
  createOpenaiChatCompletions,
  type OpenAIChatModel,
} from '@tanstack/ai-openai';
import { createFileRoute } from '@tanstack/react-router';
import type { UIMessage } from '@tanstack/ai-client';

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as {
          messages: Array<UIMessage>;
        };

        // OpenRouter speaks the OpenAI Chat Completions wire format, so we
        // point the OpenAI adapter at its base URL. Read env vars inside the
        // handler: module-scope `process.env` is undefined on Cloudflare
        // Workers, so pass OPENROUTER_API_KEY / OPENROUTER_MODEL as Worker
        // secrets/vars there. On static hosts (GitHub Pages) this route 404s.
        const model = (process.env.OPENROUTER_MODEL ??
          'deepseek/deepseek-chat') as OpenAIChatModel;
        const apiKey = process.env.OPENROUTER_API_KEY ?? '';

        const stream = chat({
          adapter: createOpenaiChatCompletions(model, apiKey, {
            baseURL: 'https://openrouter.ai/api/v1',
          }),
          messages,
          systemPrompts: [
            'You are a helpful assistant embedded in the BrotherHood FI Jetton dashboard. Keep answers short and use plain text.',
          ],
        });

        return toServerSentEventsResponse(stream);
      },
    },
  },
});
