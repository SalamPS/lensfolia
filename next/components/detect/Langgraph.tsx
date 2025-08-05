/* eslint-disable @next/next/no-img-element */
"use client"

import { LGSteps } from "@/components/detect/ module/langgrapht";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LGStep_ } from "./ module/langgraph_type";
import { useRouter } from "next/navigation";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type LangGraphVisualProps = {
	image_url: string;
	trigger?: boolean;
}

export function LangGraphVisual ({image_url, trigger = false}: LangGraphVisualProps) {
	const [processedSteps, setProcessedSteps] = useState<LGStep_[]>([]);
	const router = useRouter();

	useEffect(() => {
		(async () => {
			if (!trigger) {
				setProcessedSteps([]);
				return;
			}

			setProcessedSteps(prev => [...prev, {
				step: "start",
				title: "Menghubungi server Lensfolia.",
				description: "Mengirim permintaan untuk memulai proses diagnosis.",
				icon: "start"
			}]);
			await delay(1000);

			for (const step of LGSteps) {
				await delay(1000);
				console.log(`================\n${step.title}`);
				setProcessedSteps(prev => [...prev, step]);
				await delay(3000);
			}

			setProcessedSteps(prev => [...prev, {
				step: "end",
				title: "Mengumpulkan hasil akhir",
				description: "Proses diagnosis selesai. Mengalihkan ke halaman hasil.",
				icon: "check"
			}]);
			await delay(3000);
			router.push("/result/123");
		})()
	}, [trigger, router])

	if (!trigger) {
		return <></>;
	}

	return (
	<AnimatePresence>
		<div className="">
			<motion.div
				initial={{ 
					opacity: 0,
					// y: "100%"
				}}
				animate={{ 
					opacity: 1,
					zIndex: 998,
					y: "0",
				}}
				transition={{ duration: 1 }}
				className="flex flex-col justify-start bg-background/98 fixed overflow-hidden top-0 left-0 w-full h-full rounded-t-4xl"
				style={{ 
					zIndex: trigger ? 998 : -100,
				}}>
				<div className="h-full grid grid-rows-2 gap-6 p-6 md:p-12 xl:p-18">
					<div className="flex overflow-hidden flex-col justify-end items-center">
						<AnimatePresence mode="popLayout">
							{processedSteps.map((step, index) => (
								<motion.div
									key={step.step}
									initial={{ opacity: 0, y: 20, height: 0, marginTop: '0' }}
									animate={{ 
										opacity: index === processedSteps.length - 1 ? 1 : 0.7,
										y: 0, height: "auto", marginTop: '18px'
									}}
									exit={{ opacity: 0, y: -20, height: 0, marginTop: '18px' }}
									transition={{ 
										duration: 1, 
										ease: "easeOut"
									}}
									id={step.step}
									className="w-full"
								>
									<div className="bg-card p-4 px-5 rounded-lg shadow-lg flex items-center gap-4">
										<div className="grow">
											<b>{step.title}</b>
											<p className="text-sm text-muted-foreground mt-1">{step.description}</p>
											<div className="flex items-center mt-2">
												<img src={`/icons/${step.icon}.svg`} alt={step.title} className="w-6 h-6 mr-2" />
												<span className="text-xs text-muted-foreground">{step.step}</span>
											</div>
										</div>
										<div>
											{index == processedSteps.length -1 
											? <>
											</> 
											: <>
											</>}
											<AnimatedCheckIcon isVisible={processedSteps.length - 1 > index} />
										</div>
									</div>
								</motion.div>
							))}
						</AnimatePresence>
					</div>
					<div>

						<div className="flex flex-col md:flex-row gap-4 mb-4">
							<h2 className="text-2xl grow-0 font-bold">MEMPROSES DIAGNOSIS</h2>
							<div className="grow mt-2 bg-foreground/40 rounded-full h-4">
								<div
									className="bg-primary h-4 rounded-full transition-all duration-500"
									style={{
											width: `${((processedSteps.length / (LGSteps.length+2)) * 100)}%`,
									}}
								></div>
							</div>
						</div>
						{/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8"
							style={{
								zIndex: trigger ? 1000 : -100,
							}}>
							<img className="w-full aspect-video rounded-2xl" src={image_url} alt={"requested_image"} />
							<div className="h-full pr-4 text-justify">
								<div className="grow h-full">
									<h3 className="text-xl font-semibold mb-2">Fun Fact</h3>
									<p>
										Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem in inventore esse libero neque consectetur eius obcaecati recusandae, repellat explicabo unde labore at laudantium totam ex consequuntur, et a sunt odit aspernatur cumque? Alias, qui odit unde ratione sunt veniam atque earum odio ipsum sed dolorum a quaerat vero consequatur asperiores esse illum laudantium quidem iure autem! Magnam dignissimos expedita eaque explicabo eius maiores quas beatae facere vero, odio eos, rerum possimus temporibus minima rem qui iure. Deleniti ipsam facere quaerat magni optio ratione non recusandae maxime animi aut quis, quam accusamus corrupti alias vitae et temporibus adipisci architecto culpa. lorem50
									</p>
								</div>
							</div>
						</div> */}
					</div>
				</div>
			</motion.div>
			<motion.div
				initial={{ 
					opacity: 0,
					// y: "100%"
				}}
				animate={{ 
					opacity: 1,
					zIndex: 998,
					y: "0",
				}}
				style={{ 
					zIndex: trigger ? 999 : -100,
					boxShadow: trigger ? 'inset 0 20vh 150px var(--background)' : 'none',
					// boxShadow: trigger ? 'inset 0 -30vh 300px black, inset 0 30vh 300px black' : 'none',
				}}
				className="fixed overflow-hidden top-0 left-0 w-full h-full rounded-t-4xl"
				>
			</motion.div>
		</div>
	</AnimatePresence>);
}

function AnimatedCheckIcon({ initial = false, isVisible = false }) {
  return (
    <div className="flex items-center">
			<AnimatePresence initial={initial}>
				{isVisible && (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="var(--primary)"
						className="CheckIcon"
						height={32}
						width={32}
					>
						<motion.path
							initial={{ pathLength: 0, opacity: 0 }}
							animate={{ pathLength: 1, opacity: 1 }}
							exit={{ pathLength: 0, opacity: 0 }}
							transition={{
								type: "tween",
								duration: 0.5,
								ease: isVisible ? "easeOut" : "easeIn",
								delay: 0.5,
							}}
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M4.5 12.75l6 6 9-13.5"
						/>
					</svg>
				)}
			</AnimatePresence>

			<AnimatePresence initial={initial}>
        {!isVisible && (
          <motion.div
            className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }} // Menghilang ke kanan
            transition={{
              type: "tween",
              duration: 0.3,
              ease: "easeInOut",
            }}
          />
        )}
			</AnimatePresence>
		</div>
  );
}