// /* eslint-disable @next/next/no-img-element */
"use client"

import { LGSteps } from "@/components/detect/ module/langgrapht";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type LangGraphVisualProps = {
	image_url: string;
	trigger: boolean;
}

export function LangGraphVisual ({image_url, trigger}: LangGraphVisualProps) {
	const [processedSteps, setProcessedSteps] = useState<string[]>([]);
	const [pendingSteps, setPendingSteps] = useState<string[]>([]);
	const [currentStep, setCurrentStep] = useState<string>("");

	useEffect(() => {
		setPendingSteps(LGSteps.map(step => step.step));
		(async () => {
			for (const step of LGSteps) {
				console.log(`================\n${step.title}`);
				setCurrentStep(step.step);
				setPendingSteps(prev => prev.filter(s => s !== step.step));
				await delay(5000);
				setProcessedSteps(prev => [...prev, step.step]);
			}
		})()
	}, [image_url])

	return (
	<>
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ 
				opacity: trigger ? 1 : 0,
				zIndex: trigger ? 998 : -100,
			}}
			transition={{ duration: 0.3 }}
			className="flex flex-col justify-center fixed overflow-hidden top-0 left-0 w-full h-full bg-background"
			style={{ 
				zIndex: trigger ? 998 : -100,
			}}>
			<div className="grid grid-rows-3 gap-4 transition-200">
				<div className="flex flex-col justify-end items-center text-muted-foreground text-sm">
					<AnimatePresence mode="popLayout">
						{processedSteps.map((step, index) => (
							<motion.div 
								key={step}
								initial={{ opacity: 0, y: 20, scale: 0.8 }}
								animate={{ opacity: 0.7, y: 0, scale: 1 }}
								exit={{ opacity: 0, y: -10, scale: 0.9 }}
								transition={{ 
									duration: 0.5, 
									delay: index * 0.1,
									ease: "easeInOut"
								}}
								id={step}
							>
								{step}
							</motion.div>
						))}
					</AnimatePresence>
				</div>
				<div className="flex flex-col justify-center items-center">
					<AnimatePresence mode="wait">
						{currentStep && (
							<motion.div
								key={currentStep}
								initial={{ opacity: 0, scale: 0.5, rotateX: -90 }}
								animate={{ 
									opacity: 1, 
									scale: 1, 
									rotateX: 0,
									textShadow: "0 0 20px rgba(59, 130, 246, 0.5)"
								}}
								exit={{ opacity: 0, scale: 1.2, rotateX: 90 }}
								transition={{ 
									duration: 0.8,
									ease: "easeInOut",
									scale: { type: "spring", damping: 10, stiffness: 100 }
								}}
								className="text-lg font-semibold text-primary"
								id={currentStep}
							>
								<div className="bg-card p-4 rounded-lg shadow-lg">
									{currentStep}
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
				<div className="flex flex-col justify-start items-center text-muted-foreground text-sm">
					<AnimatePresence mode="popLayout">
						{pendingSteps.map((step, index) => (
							<motion.div 
								key={step}
								initial={{ opacity: 0, y: -20, scale: 0.8 }}
								animate={{ opacity: 0.5, y: 0, scale: 1 }}
								exit={{ opacity: 0, y: 10, scale: 0.9 }}
								transition={{ 
									duration: 0.5, 
									delay: index * 0.05,
									ease: "easeInOut"
								}}
								id={step}
							>
								{step}
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</div>
		</motion.div>
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ 
				opacity: trigger ? 1 : 0,
				zIndex: trigger ? 999 : -100,
			}}
			transition={{ duration: 0.3 }}
			style={{ 
				zIndex: trigger ? 999 : -100,
				boxShadow: trigger ? 'inset 0 -35vh 230px var(--background), inset 0 35vh 230px var(--background)' : 'none',
				// boxShadow: trigger ? 'inset 0 -30vh 300px black, inset 0 30vh 300px black' : 'none',
			}}
			className="fixed overflow-hidden top-0 left-0 w-full h-full flex items-center justify-center flex-col"
			>
		</motion.div>
	</>);
}