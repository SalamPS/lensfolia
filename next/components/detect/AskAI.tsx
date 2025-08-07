"use client";

import { IconSend, IconSparkles } from "@tabler/icons-react";
import { useState, useRef, useEffect } from "react";
import { LFDResult_ } from "../types/diagnoseResult";

// Define our own message type
interface ChatMessage {
	id: string;
	type: "human" | "ai";
	content: string;
}

const AIBubble = ({ text, onClick }: { text: string; onClick?: () => void }) => {
	return (
		<div 
			className="bg-secondary shadow-foreground/[0.1] hover:bg-secondary/80 m-1 inline-block cursor-pointer rounded-full p-2 px-3 text-xs shadow-inner transition-colors"
			onClick={onClick}
		>
			{text}
		</div>
	);
};

const ChatMessageComponent = ({ message }: { message: ChatMessage }) => {
	return (
		<div className={`mb-4 ${message.type === "human" ? "text-right" : "text-left"}`}>
			<div className={`inline-block max-w-[80%] rounded-2xl p-3 ${
				message.type === "human" 
					? "bg-primary text-primary-foreground" 
					: "bg-secondary text-secondary-foreground"
			}`}>
				{message.content}
			</div>
		</div>
	);
};

export function AskAI ({disease}: {disease: LFDResult_ | undefined}) {
	const [inputValue, setInputValue] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const threadId = useRef(`thread-${Date.now()}`);

	// Auto scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const sendMessage = async (message: string) => {
		setIsLoading(true);
		setError(null);

		// Add user message
		const userMessage: ChatMessage = {
			id: `user-${Date.now()}`,
			type: "human",
			content: message
		};
		setMessages(prev => [...prev, userMessage]);

		// Create AI message placeholder for streaming
		const aiMessageId = `ai-${Date.now()}`;
		const initialAiMessage: ChatMessage = {
			id: aiMessageId,
			type: "ai",
			content: ""
		};
		setMessages(prev => [...prev, initialAiMessage]);

		try {
			// Add context about the disease to the message if available
			const contextualMessage = disease 
				? `Konteks: Deteksi menunjukkan ${disease.encyclopedia?.name || 'hasil deteksi'}. Skor: ${disease.score}. Pertanyaan: ${message}`
				: message;

			const response = await fetch(`${"http://0.0.0.0:3001"}/chat/stream`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					message: contextualMessage,
					thread_id: threadId.current
				})
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			if (!response.body) {
				throw new Error('Response body is null');
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';

			try {
				while (true) {
					const { done, value } = await reader.read();
					
					if (done) break;
					
					buffer += decoder.decode(value, { stream: true });
					const lines = buffer.split('\n');
					buffer = lines.pop() || '';

					for (const line of lines) {
						if (line.trim() === '') continue;
						
						if (line.startsWith('data: ')) {
							try {
								const data = JSON.parse(line.slice(6));
								
								if (data.error) {
									throw new Error(data.error);
								}
								
								if (data.type === 'done') {
									break;
								}
								
								if (data.content) {
									// Update the AI message content progressively
									setMessages(prev => prev.map(msg => 
										msg.id === aiMessageId 
											? { ...msg, content: data.content }
											: msg
									));
								}
							} catch (parseError) {
								console.error('Error parsing streaming data:', parseError);
							}
						}
					}
				}
			} finally {
				reader.releaseLock();
			}

		} catch (err) {
			console.error("Chat error:", err);
			setError("Terjadi kesalahan saat menghubungi AI. Pastikan server LangGraph berjalan di port 3001.");
			
			// Remove the empty AI message if there was an error
			setMessages(prev => prev.filter(msg => msg.id !== aiMessageId));
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!inputValue.trim() || isLoading) return;

		const message = inputValue.trim();
		setInputValue("");
		sendMessage(message);
	};

	const handleBubbleClick = (text: string) => {
		setInputValue(text);
	};

	return (
		<div id="ask-ai" className="border-border rounded-3xl border-[1px]">
			<h3 className="border-border text-foreground flex items-center justify-center border-b-[1px] p-2 py-6 font-semibold">
				<IconSparkles className="mr-2 inline" size={24} />
				Konsultasi lebih lanjut dengan AI
			</h3>
			<div className="flex flex-col gap-4 px-6">
				{/* Error Display */}
				{error && (
					<div className="bg-destructive/10 text-destructive border-destructive rounded-lg border p-3 text-sm">
						{error}
					</div>
				)}
				
				<div className="flex h-80 grow flex-col">
					{/* Chat Messages Area */}
					<div className="flex-1 overflow-y-auto px-2 py-4">
						{messages.length === 0 ? (
							<div className="flex h-full flex-col items-center justify-center text-foreground">
								<h4 className="mb-8 font-semibold">
									Apa yang bisa saya bantu?
								</h4>
								<div className="w-[80%] text-center">
									{disease?.ai_bubble?.length
										? disease.ai_bubble.map((text, index) => (
												<AIBubble 
													key={index} 
													text={text} 
													onClick={() => handleBubbleClick(text)}
												/>
											))
										: [
											"Bagaimana cara mengobati penyakit ini?",
											"Apa penyebab penyakit daun ini?",
											"Tips pencegahan penyakit tanaman?",
											"Produk apa yang direkomendasikan?"
										  ].map((text, index) => (
											<AIBubble 
												key={index} 
												text={text} 
												onClick={() => handleBubbleClick(text)}
											/>
										  ))}
								</div>
							</div>
						) : (
							<div>
								{messages.map((message) => (
									<ChatMessageComponent key={message.id} message={message} />
								))}
								{isLoading && (
									<div className="mb-4 text-left">
										<div className="inline-block max-w-[80%] rounded-2xl bg-secondary p-3 text-secondary-foreground">
											<div className="flex items-center space-x-1">
												<div className="h-2 w-2 animate-bounce rounded-full bg-current"></div>
												<div className="h-2 w-2 animate-bounce rounded-full bg-current" style={{ animationDelay: '0.1s' }}></div>
												<div className="h-2 w-2 animate-bounce rounded-full bg-current" style={{ animationDelay: '0.2s' }}></div>
											</div>
										</div>
									</div>
								)}
								<div ref={messagesEndRef} />
							</div>
						)}
					</div>
				</div>
				
				{/* Input Form */}
				<form onSubmit={handleSubmit} className="bg-secondary mt-2 flex rounded-t-2xl p-3 px-5">
					<input
						className="text-muted-foreground grow bg-transparent outline-none"
						type="text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						placeholder="Tanyakan apapun terkait deteksi daunmu"
						disabled={isLoading}
					/>
					{isLoading ? (
						<button 
							type="button" 
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full p-3 transition-colors"
							title="Stop"
							disabled
						>
							<div className="h-4 w-4 rounded-sm bg-current"></div>
						</button>
					) : (
						<button 
							type="submit"
							className="bg-foreground text-background hover:bg-primary/10 rounded-full p-3 transition-colors disabled:opacity-50"
							disabled={!inputValue.trim()}
						>
							<IconSend />
						</button>
					)}
				</form>
			</div>
		</div>
	);
}