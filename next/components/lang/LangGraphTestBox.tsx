/* eslint-disable @next/next/no-img-element */
import { useStream } from "@langchain/langgraph-sdk/react";
import type { Message } from "@langchain/langgraph-sdk";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

export function LangGraphTestBox () {
	const {user} = useAuth();

	const thread = useStream<{ 
    messages: Message[];
    image_url: string;
    diagnoses_ref: string;
		created_by: string;
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
			setImage("https://ucofsfjumfhpuhnptaro.supabase.co/storage/v1/object/public/image-plant/uploads/1754496896731-ejiocaylkm.jpg")
    })();
  }, []);
	
	return (
		<div className="p-6 max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-4">
				MLaaS Tester
			</h1>
			{image && (
				<div>
					<img src={image} alt="Annotated result" style={{ maxWidth: "100%", height: "auto" }} />
				</div>
			)}
			<div className="mt-4">
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
					const submitData ={
						image_url: image || "",
						diagnoses_ref: "d54e907f-63aa-47e3-a08e-4db19fd75c7a",
						created_by: user?.id || "anonymous",
					}
					console.log("New messages:", submitData);
					thread.submit({
						...submitData,
						messages: newMessages,
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
		</div>
	)
}