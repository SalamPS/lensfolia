/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useStream } from "@langchain/langgraph-sdk/react";
import type { Message } from "@langchain/langgraph-sdk";

export default function App() {
  const thread = useStream<{ 
    messages: Message[];
    image_url: string;
   }>({
    apiUrl: "https://jay-fit-safely.ngrok-free.app/",
    assistantId: "agent",
    messagesKey: "messages",
    onUpdateEvent(event: any) {
      // if (!LGSteps.includes(event.step)) return;
			console.log("Event received:", event);

      if (event.plant_disease_detection) {
      }
      else if (event.overview_query_generation) {
      }
      else if (event.overview_rag) {
      }
      else if (event.treatment_query_generation) {
      }
      else if (event.treatment_rag) {
      }
      else if (event.product_query_generation) {
      }
      else if (event.product_rag) {
      }
      else if (event.create_final_response) {
      }
    }
  });

  return (
    <div style={{
			backgroundColor: "#white",
			color: "white",
		}}>
      <div>
        {thread.messages.map((message) => (
          <div key={message.id}>{message.content as string}</div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();

          const form = e.target as HTMLFormElement;
          const message = new FormData(form).get("message") as string;

          form.reset();
          const newMessages: Message[] = [
            ...(thread.messages || []),
            {
              type: "human",
              content: message,
              id: Date.now().toString(),
            },
          ];
          thread.submit({
            messages: newMessages,
            image_url: "https://plantvillage-production-new.s3.amazonaws.com/image/99416/file/default-eb4701036f717c99bf95001c1a8f7b40.jpg",
          });
        }}
      >
        <input type="text" name="message" style={{
					backgroundColor: "#444",
					color: "#fff",
				}}/>

        {thread.isLoading ? (
          <button style={{backgroundColor: "#f00"}} key="stop" type="button" onClick={() => thread.stop()}>
            Stop
          </button>
        ) : (
          <button style={{backgroundColor: "#f00"}} type="submit">Send</button>
        )}
      </form>
    </div>
  );
}