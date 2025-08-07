/* eslint-disable @next/next/no-img-element */
'use client'

import { IconSend } from "@tabler/icons-react"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import Markdown from "react-markdown"

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

	const scrollerRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)
	
	useEffect(() => {
		scrollerRef.current?.scrollTo(0, scrollerRef.current.scrollHeight)
	}, [chatLog])

	const sendChat = async (e: { preventDefault: () => void }) => {
		e.preventDefault()
		if (!chatTmp) return
		setChatTmp('')
		setChatLog([...chatLog, {
			message: chatTmp,
			role: 'user'
		}])
	}

	if (!path.includes('/assistant')) return <>
		<div className={`z-[9998] fixed flex flex-col items-end bottom-0 right-0 p-1 md:p-4`}
			style={{
				transition: '0.3s ease-out'
			}}>
			<button className={`z-[9999] md:scrollnima-none bg-primary/80 duration-500 w-12 h-12 flex items-center ${prepOpen? 'w-[calc(100vw-0.5rem)] md:w-[30vw] opacity-100 justify-between px-2' : 'hover:scale-[1.03] justify-center'} ${open?'cursor-default rounded-t-[1rem]':'scrollnima-btt-[0,97] cursor-pointer rounded-[3rem]'}`}
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
			<div className={`z-[9998] flex flex-col justify-between bg-card/80 backdrop-blur-lg hover:bg-card border-primary shadow-md overflow-hidden rounded-b-xl w-[calc(100vw-0.5rem)] md:w-[30vw] ${open? 'md:h-[60vh] border-2 ' + (!focus ? 'h-[calc(90vh-3.5rem)]' : 'h-[calc(45vh-3.5rem)]') : 'h-0 w-0'}`}
				style={{
					opacity: !open ? 0 : 1,
					transition: '0.3s',
				}}>
				<div ref={scrollerRef} className="grow overflow-y-auto pt-2 pb-3 hidden-scroll">
					{chatLog.map((chat, idx) => (
						<div key={idx} className={`px-4 py-2 ${chat.role === 'bot' ? 'text-left text-foreground' : 'text-right text-background'}`}>
							<div className={`${chat.role === 'bot' ? 'bg-primary/80' : 'bg-card'} px-4 py-2 rounded-lg shadow-md inline-block max-w-[80%]`}>
								<Markdown>
									{chat.message}
								</Markdown>
							</div>
						</div>
					))}
				</div>
	
				<form onSubmit={sendChat} className="shadow-md cursor-default flex items-center">
					<input 
						type="text" 
						className="grow px-4 py-4 hidden-scroll border-none rounded-tr-lg shadow-sm outline-none ring-1 ring-primary duration-200 focus:ring-primary bg-card placeholder:text-sm" 
						value={chatTmp} 
						onFocus={() => setFocus(true)}
						onBlur={() => setFocus(false)}
						placeholder="Tanya apapun tentang LensFolia!" 
						onChange={(e) => (e.target.value.length < 100) ? setChatTmp(e.target.value) : ''} 
					/>
					<button type="submit" className="flex items-center justify-center cursor-pointer bg-primary/80 hover:bg-primary duration-200 h-10 aspect-square rounded-full mx-4">
						<IconSend className="mr-1"/>
					</button>
				</form>
			</div>
		</div>
	</>
}