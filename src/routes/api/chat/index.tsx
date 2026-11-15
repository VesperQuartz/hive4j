import { chat, toServerSentEventsResponse, type ModelMessage } from "@tanstack/ai";
import { ollamaText } from "@tanstack/ai-ollama";
import { createFileRoute } from "@tanstack/react-router";

type ChatRequestBody = {
  threadId?: string;
  messages: ModelMessage[];
};

const Chat = () => {
  return <div>Chat</div>;
};

export const Route = createFileRoute("/api/chat/")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatRequestBody;
        const stream = chat({
          adapter: ollamaText("mrlectus"),
          messages: body.messages,
          threadId: body.threadId ?? crypto.randomUUID(),
        });
        return toServerSentEventsResponse(stream);
      },
    },
  },
  component: Chat,
});
