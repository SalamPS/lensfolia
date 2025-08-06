/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useStream } from "@langchain/langgraph-sdk/react";
import type { Message } from "@langchain/langgraph-sdk";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { OfflineTest } from "@/components/pwa/OfflineTest";
import { ServiceWorkerDebug } from "@/components/pwa/ServiceWorkerDebug";

export default function App() {
  const thread = useStream<{ 
    messages: Message[];
    image_url: string;
    diagnoses_ref: string;
   }>({
    apiUrl: "https://jay-fit-safely.ngrok-free.app/",
    assistantId: "agent",
    messagesKey: "messages",
    onUpdateEvent(event: any) {
      // if (!LGSteps.includes(event.step)) return;
			console.log("Event received:", event);
    }
  });

  const [image, setImage] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      const response = await supabase
        .from("test_diagnosis_results")
        .select("annotated_image")
        .eq("id", "63c83253-e966-4b64-a9f1-cc3f5b5b6cd0")
        .single();
      if (response.data) {
        const base64Image = response.data.annotated_image;
        setImage(base64Image);
      }
    })();
  }, []);

  return (
    <div style={{
			backgroundColor: "#white",
			color: "white",
		}}>
      {image && (
        <div>
          <img src={image} alt="Annotated result" style={{ maxWidth: "100%", height: "auto" }} />
        </div>
      )}
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
            diagnoses_ref: "32af0ef8-bd5d-4074-8733-99d5f393910d",
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
      
      <div className="mt-8 border-t pt-8">
        <ServiceWorkerDebug />
      </div>
      
      <div className="mt-8 border-t pt-8">
        <OfflineTest />
      </div>
    </div>
  );
}