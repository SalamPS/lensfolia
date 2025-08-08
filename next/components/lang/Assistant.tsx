/* eslint-disable @next/next/no-img-element */
'use client'

import { IconSend } from "@tabler/icons-react"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import Markdown from "react-markdown"
import { v4 as uuidv4 } from 'uuid'

interface _chatLog {
	message: string
	role: 'user' | 'bot'
}

export default function DokterLensfoliaFloating () {
	const path = usePathname()
	const [chatLog, setChatLog] = useState<_chatLog[]>([{
		message: 'Hai, saya Dokter Lensfolia, asisten virtual-mu di LensFolia',
		role: 'bot'
	}])
	const [chatTmp, setChatTmp] = useState('')
	const [prepOpen, setPrepOpen] = useState(false)
	const [open, setOpen] = useState(false)
	const [focus, setFocus] = useState(false)
	const [threadId] = useState<string>(uuidv4() + '-' + new Date().getTime().toString(36))

	const scrollerRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)
	
	useEffect(() => {
		scrollerRef.current?.scrollTo(0, scrollerRef.current.scrollHeight)
	}, [chatLog])

	const sendChat = async (e: { preventDefault: () => void }) => {
		e.preventDefault()
		if (!chatTmp) return
		setChatTmp('')
		const rawData: _chatLog[] = [{
			message: chatTmp,
			role: 'user',
		}]
		setChatLog([...chatLog, ...rawData])
		const base_url = "https://lensfolia-chatbot.andyathsid.com"
		const firstTry = await fetch(`${base_url}/api/chat`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({ content: chatTmp, thread_id: threadId })
		})
		.then(async (response) => {
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
			return response.json()
		})
		.then((data) => {
			rawData.push({ message: data.content, role: 'bot' })
			setChatLog([...chatLog, ...rawData])
			return true
		})
		.catch((error) => {
			console.error('Error fetching chat response:', error)
			rawData.push({ message: 'Maaf, terjadi kesalahan saat menghubungi server.', role: 'bot' })
			setChatLog([...chatLog, ...rawData])
			return false
		})
		// if (!firstTry) {
		// 	await fetch('https://jay-fit-safely.ngrok-free.app/api/chat', {
		// 		method: 'POST',
		// 		headers: {'Content-Type': 'application/json'},
		// 		body: JSON.stringify({ message: chatTmp, threadId })
		// 	})
		// 	.then(async (response) => {
		// 		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
		// 		return response.json()
		// 	})
		// 	.then((data) => {
		// 		rawData.push({ message: data.message, role: 'bot' })
		// 		setChatLog([...chatLog, ...rawData])
		// 		return true
		// 	})
		// 	.catch((error) => {
		// 		console.error('Error fetching chat response:', error)
		// 		rawData.push({ message: 'Maaf, terjadi kesalahan saat menghubungi server.', role: 'bot' })
		// 		setChatLog([...chatLog, ...rawData])
		// 		return false
		// })
		// }
	}

	if (!path.includes('/assistant') && !path.includes('post')) return <>
		<div className={`z-[9998] fixed flex flex-col items-end bottom-0 right-0 p-1 md:p-4`}
			style={{
				transition: '0.3s ease-out'
			}}>
			<button className={`z-[9999] md:scrollnima-none bg-primary/80 duration-500 w-12 h-12 flex items-center ${prepOpen? 'w-[calc(100vw-0.5rem)] md:w-[50vw] lg:w-[30vw] opacity-100 justify-between px-2' : 'hover:scale-[1.03] justify-center'} ${open?'cursor-default rounded-t-[1rem]':'scrollnima-btt-[0,97] cursor-pointer rounded-[3rem]'}`}
				onClick={() => {
					if (!prepOpen && !open) {
						setPrepOpen(true)
						setTimeout(() => setOpen(true), 500)
					}
				}}
				ref={buttonRef}>
				<div className="px-2 flex items-center justify-start grow">
					<img src="/logo-ai.png" alt="chat" className='w-6 inline-block hover:rotate-[-25deg]' style={{
						rotate: prepOpen ? '180deg' : '0deg',
						marginLeft: open ? '0' : '0.2rem',
						transition: '.7s'
					}}/>
					<div className={`text-lg text-start font-bold inline-block overflow-hidden text-foreground ${open ? 'w-full ml-2' : 'w-0'}`}>Chat AI LensFolia</div>
				</div>
				<div className={`bg-card/80 hover:bg-card/90 duration-200 aspect-square rounded-full flex items-center justify-center cursor-pointer overflow-hidden ${open ? 'h-8' : 'h-0'}`}
					onClick={() => {
						if (open && prepOpen) {
							setOpen(false)
							setTimeout(() => setPrepOpen(false), 300)
						}
					}}>
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
							<line x1="5" y1="5" x2="15" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
							<line x1="15" y1="5" x2="5" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
						</svg>
				</div>
			</button>
			<div className={`flex flex-col justify-between bg-card/80 backdrop-blur-lg hover:bg-card border-primary shadow-md overflow-hidden rounded-b-xl w-[calc(100vw-0.5rem)] md:w-[50vw] lg:w-[30vw] z-[-999] ${open? 'md:h-[60vh] border-2 z-[9999] md:w-[50vw] lg:w-[30vw] ' + (!focus ? 'h-[calc(90vh-3.5rem)]' : 'h-[calc(45vh-3.5rem)]') : 'h-0 w-0'}`}
				style={{
					opacity: !open ? 0 : 1,
					transition: '0.3s',
				}}>
				<div ref={scrollerRef} className="grow overflow-y-auto pt-2 pb-3 hidden-scroll">
					{chatLog.map((chat, idx) => (
						<div key={idx} className={`px-3 py-2 text-sm md:text-base ${chat.role === 'bot' ? 'text-left text-foreground' : 'text-right text-background'}`}>
							<div className={`${chat.role === 'bot' ? 'bg-teal-800' : 'bg-border text-foreground'} px-4 py-2 rounded-lg inline-block max-w-[80%]`}>
								<Markdown>
									{chat.message}
								</Markdown>
							</div>
						</div>
					))}
				</div>
	
				<form onSubmit={sendChat} className="cursor-default flex gap-2 p-3 justify-between items-center">
					<input 
						type="text" 
						className="grow w-full h-full p-1.5 px-2 hidden-scroll rounded border-none outline-none duration-200 ring-1 ring-border focus:ring-3 focus:ring-primary/50 bg-background/90 placeholder:text-sm" 
						value={chatTmp} 
						onFocus={() => setFocus(true)}
						onBlur={() => setFocus(false)}
						placeholder="Tanya apapun tentang LensFolia!" 
						onChange={(e) => (e.target.value.length < 100) ? setChatTmp(e.target.value) : ''} 
					/>
					<button type="submit" className="flex items-center justify-center cursor-pointer bg-primary/80 hover:bg-primary duration-200 p-2 aspect-square rounded-full">
						<IconSend size={20} className="text-white"/>
					</button>
				</form>
			</div>
		</div>
	</>
}