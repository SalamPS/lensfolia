/* eslint-disable @next/next/no-img-element */
import { useStream } from "@langchain/langgraph-sdk/react";
import type { Message } from "@langchain/langgraph-sdk";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function LangGraphTestBox () {
	const thread = useStream<{ 
    messages: Message[];
    image_url: string;
    diagnoses_ref: string;
   }>({
    apiUrl: "https://jay-fit-safely.ngrok-free.app/",
    assistantId: "agent",
    messagesKey: "messages",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
	
	return (<>
		<h1 className="text-2xl font-bold mb-4">
			MLaaS Tester
		</h1>
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
				<div className="flex items-center gap-2">
				<input
					type="text"
					name="message"
					className="flex-1 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none"
					placeholder="Type your message..."
				/>

				{thread.isLoading ? (
					<button
						type="button"
						onClick={() => thread.stop()}
						className="px-4 py-2 bg-destructive/60 text-white rounded-lg hover:bg-destructive/80"
					>
						Stop
					</button>
				) : (
					<button
						type="submit"
						className="px-4 py-2 bg-primary/60 text-white rounded-lg hover:bg-primary/80"
					>
						Send
					</button>
				)}
				</div>
		</form>
	</>)
}