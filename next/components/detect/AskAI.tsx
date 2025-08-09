/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { IconSend, IconSparkles } from "@tabler/icons-react";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { LFDResult_ } from "../types/diagnoseResult";
import { useStream } from "@langchain/langgraph-sdk/react";
import { Message } from "@langchain/langgraph-sdk";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/supabase";

// Define our own message type
interface ChatMessage {
	id: string;
	type: "human" | "ai";
	content: string;
	isTyping?: boolean;
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

const TypewriterText = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
	const [displayedText, setDisplayedText] = useState("");
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		if (currentIndex < text.length) {
			const timeout = setTimeout(() => {
				// Find next word boundary or single character
				const nextSpace = text.indexOf(' ', currentIndex);
				const nextChar = currentIndex + 1;
				
				// If we find a space within 8 characters, jump to end of word for faster typing
				const nextIndex = nextSpace !== -1 && nextSpace <= currentIndex + 8 
					? nextSpace + 1 
					: nextChar;
				
				setDisplayedText(text.substring(0, nextIndex));
				setCurrentIndex(nextIndex);
			}, Math.random() * 50 + 25); // Variable speed for more natural effect (25-75ms)
			
			return () => clearTimeout(timeout);
		} else {
			// Hide cursor after typing is complete
			const cursorTimeout = setTimeout(() => {
				if (onComplete) {
					onComplete();
				}
			}, 500);
			
			return () => clearTimeout(cursorTimeout);
		}
	}, [currentIndex, text, onComplete]);

	return (
		<span>
			<ReactMarkdown>
				{displayedText}
			</ReactMarkdown>
		</span>
	);
};

const ChatMessageComponent = ({ message }: { message: ChatMessage }) => {
	const [showTyping, setShowTyping] = useState(message.type === "ai" && message.isTyping);
	const [isComplete, setIsComplete] = useState(false);
	
	const handleTypingComplete = () => {
		setShowTyping(false);
		setIsComplete(true);
	};
	
	return (
		<div className={`mb-4 transition-all duration-300 ${message.type === "human" ? "text-right" : "text-left"}`}>
			<div className={`inline-block max-w-[80%] rounded-2xl p-3 transition-all duration-200 ${
				message.type === "human" 
					? "bg-primary/70 text-primary-foreground" 
					: "bg-secondary text-secondary-foreground p-4 px-5"
			} ${showTyping ? "shadow-lg" : ""}`}>
				{message.type === "ai" && showTyping ? (
					<TypewriterText 
						text={message.content} 
						onComplete={handleTypingComplete}
					/>
				) : (
					<span className={isComplete ? "animate-in fade-in duration-200" : ""}>
						<ReactMarkdown>
							{message.content.replace("\n", "\n\n")}
						</ReactMarkdown>
					</span>
				)}
			</div>
		</div>
	);
};

export function AskAI ({disease, thread_id}: {disease: LFDResult_ | undefined, thread_id: string}) {
	const [inputValue, setInputValue] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const thread = useStream<{
		messages: Message[];
		task_type: string;
	}>({
		apiUrl: process.env.NEXT_PUBLIC_AGENTIC_RESULT_API || "https://lensfolia-diagnosis.andyathsid.com/",
		assistantId: "agent",
		messagesKey: "messages",
		threadId: thread_id,
		onUpdateEvent(event: any) {
			setIsWaitingForResponse(false);
			setMessages(prev => ([
				...prev, {
					id: `ai-${Date.now()}`,
					type: "ai",
					content: event.qa_agent.messages[event.qa_agent.messages.length - 1].content,
					isTyping: true
				}
			]))
			saveChatHelper(event.qa_agent.messages[event.qa_agent.messages.length - 1].content, true);
			console.log("Event received:", event);
		},
	});

	const saveChatHelper = async (message:string, isBot:boolean) => {
		const { error } = await supabase
			.from("diagnoses_chat")
			.insert({
				type: isBot ? "ai" : "human",
				content: message,
				diagnoses_ref: disease?.id,
				id: new Date().getTime(),
			});
		if (error) {
			console.log(error);
		}
	};

	// Auto scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isWaitingForResponse]);

	const handleStop = useCallback(() => {
		try {
			setIsLoading(false);
			setIsWaitingForResponse(false);
			const stopMessage: ChatMessage = {
				id: `stop-${Date.now()}`,
				type: "ai",
				content: "⚠️ Permintaan dihentikan oleh pengguna."
			};
			setMessages(prev => [...prev, stopMessage]);
			setError(null);
		} catch (err) {
			console.error("Error stopping request:", err);
			setError("Terjadi kesalahan saat menghentikan permintaan.");
		}
	}, []);

	useEffect(() => {
		(async () => {
			const response = await supabase
				.from("diagnoses_chat")
				.select("*")
				.eq("diagnoses_ref", disease?.id)
				.order("id", { ascending: true });
			if (response.data) {
				const initialMessages = response.data.map(chat => ({
					id: chat.id.toString(),
					type: chat.type as "human" | "ai",
					content: chat.content,
				}));
				setMessages(initialMessages);
			}
		})()
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Handle Escape key to stop current request
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && (isLoading || isWaitingForResponse)) {
				handleStop();
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [isLoading, isWaitingForResponse, handleStop]);

	const sendMessage = async (message: string) => {
		setIsLoading(true);
		setIsWaitingForResponse(true);
		setError(null);

		const userMessage: ChatMessage = {
			id: `user-${Date.now()}`,
			type: "human",
			content: message
		};
		setMessages(prev => [...prev, userMessage]);
		try {
			const newMessages: Message[] = [
				...(thread.messages || []), {
					type: "human",
					content: message,
					id: Date.now().toString(),
				},
			];
			thread.submit({
				task_type: "qa",
				messages: newMessages,
			})
			await saveChatHelper(message, false)
		} catch (err) {
			console.error("Chat error:", err);
			setError("Terjadi kesalahan saat menghubungi AI.");
			setIsWaitingForResponse(false);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!inputValue.trim() || isLoading || isWaitingForResponse) return;

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
			<div className="flex flex-col px-6">
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
								{isWaitingForResponse && (
									<div className="mb-4 text-left animate-in slide-in-from-bottom-2 duration-300">
										<div className="inline-block max-w-[80%] rounded-2xl bg-secondary p-4 text-secondary-foreground border border-border/50">
											<div className="flex items-center space-x-3">
												<div className="flex items-center space-x-1">
													<div className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary"></div>
													<div className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0.1s' }}></div>
													<div className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0.2s' }}></div>
												</div>
												<div className="flex flex-col">
													<span className="text-sm font-medium">Dokter Lensi sedang berpikir...</span>
													<span className="text-xs opacity-60">Mohon tunggu sebentar</span>
												</div>
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
						className="text-muted-foreground grow bg-transparent outline-none disabled:opacity-50"
						type="text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						placeholder="Tanyakan apapun terkait deteksi daunmu"
						disabled={isLoading || isWaitingForResponse}
					/>
					{(isLoading || isWaitingForResponse) ? (
						<button 
							type="button" 
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-95 rounded-full p-3 transition-all duration-150 shadow-sm"
							title="Hentikan permintaan (Tekan Escape)"
							onClick={handleStop}
						>
							<div className="h-4 w-4 rounded-sm bg-current animate-pulse"></div>
						</button>
					) : (
						<button 
							type="submit"
							className="bg-foreground text-background hover:bg-foreground/90 active:scale-95 rounded-full p-3 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
							disabled={!inputValue.trim() || isLoading || isWaitingForResponse}
						>
							<IconSend />
						</button>
					)}
				</form>
			</div>
		</div>
	);
}