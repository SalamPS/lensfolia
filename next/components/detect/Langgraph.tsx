/* eslint-disable @next/next/no-img-element */
"use client"

import { LGFail, LGPrepare, LGStart, LGSteps, LGUpload } from "@/components/detect/ module/langgrapht";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LGStep_ } from "./ module/langgraph_type";
import { useRouter } from "next/navigation";
import { LFD_ } from "../types/diagnoseResult";
import { Button } from "../ui/button";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type LangGraphVisualProps = {
	setTrigger: (trigger: boolean) => void;
	trigger: boolean;
	diagnose_data: LFD_ | null;
	uploadStatus: string;
}

export function LangGraphVisual ({
	setTrigger,
	trigger = false, 
	diagnose_data, 
	uploadStatus
}: LangGraphVisualProps) {
	const [processedSteps, setProcessedSteps] = useState<LGStep_[]>([]);
	const [processedStatus, setProcessedStatus] = useState<string[]>(["loading"]);
	const router = useRouter();

	const statusHelper = (status:string, future?:string) => {
		setProcessedStatus(prev => {
			const newStatus = [...prev];
			const index = newStatus.length;
			if (index > 0) {
				newStatus[index - 1] = status;
			}
			newStatus.push(future || "loading");
			return [...newStatus]
		})
	}

	useEffect(() => {
		(async () => {
			if (uploadStatus === "idle") {
				setProcessedSteps([]);
				setProcessedStatus(["loading"]);
				return;
			}
			if (uploadStatus === "prepare") {
				setProcessedSteps(prev => [...prev, LGPrepare]);
				await delay(3000);
				statusHelper("success");
				setProcessedSteps(prev => [...prev, LGUpload]);
				return;
			}

			await delay(3000);
			if (uploadStatus === "error" || !diagnose_data) {
				statusHelper("error", "error");
				setProcessedSteps(prev => [...prev, LGFail({
					title: "Gagal memproses diagnosis",
					description: "Terjadi kesalahan dalam proses diagnosis. Silakan coba lagi.",
					icon: "error"
				})]);
				return;
			}
			if (uploadStatus === "success") {
				statusHelper("success");
				setProcessedSteps(prev => [...prev, LGStart]);
			}

			await delay(3000);
			for (const step of LGSteps) {
				console.log(`================\n${step.title}`);
				statusHelper("success");
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
			statusHelper("success");
			await delay(500);
			router.push("/result/"+diagnose_data?.id);
		})()
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router, uploadStatus]);

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
				transition={{ duration: .4 }}
				className="flex flex-col justify-start bg-background/98 fixed overflow-hidden top-0 left-0 w-full h-full rounded-t-4xl"
				style={{ 
					zIndex: trigger ? 998 : -100,
				}}>
				<div className="h-full grid grid-rows-2 gap-6 p-6 md:p-12 xl:p-18">
					<div className="flex overflow-hidden flex-col justify-end items-center">
						<AnimatePresence mode="popLayout">
							{processedSteps.map((step, index) => (
								<motion.div
									key={step.step + index}
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
											<AnimatedCheckIcon isVisible={processedSteps.length - 1 > index} fail={processedStatus[index] === "error"}/>
										</div>
									</div>
								</motion.div>
							))}
						</AnimatePresence>
					</div>
					{/* <div className="flex flex-col">
						<div className="flex flex-col md:flex-row gap-4 mb-4">
							<h2 className="text-2xl grow-0 font-bold">
								{processedStatus.includes("error") ? "GAGAL MEMPROSES DIAGNOSIS" : "MEMPROSES DIAGNOSIS"}
							</h2>
							<div className="grow mt-2 bg-foreground/40 rounded-full h-4">
								{processedStatus.includes("error") ? (
									<div
										className="bg-destructive/60 h-4 rounded-full transition-all duration-500 w-full"
									/>
								) : (
									<div
										className="bg-primary h-4 rounded-full transition-all duration-500"
										style={{
												width: `${((processedSteps.length / (LGSteps.length+4)) * 100)}%`,
										}}
									></div>
								)}
							</div>
						</div>
						{processedStatus.includes("error") 
						&& <Button variant={"destructive"} className="w-full cursor-pointer" onClick={() => {setTrigger(false)}}>
							Kembali
						</Button>}
					</div> */}
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
				<div className="h-full grid grid-rows-2 gap-6 p-6 md:p-12 xl:p-18">
					<div></div>
					<div className="flex flex-col">
						<div className="flex flex-col md:flex-row gap-4 mb-4">
							<h2 className="text-2xl grow-0 font-bold">
								{processedStatus.includes("error") ? "GAGAL MEMPROSES DIAGNOSIS" : "MEMPROSES DIAGNOSIS"}
							</h2>
							<div className="grow mt-2 bg-foreground/40 rounded-full h-4">
								{processedStatus.includes("error") ? (
									<div
										className="bg-destructive/60 h-4 rounded-full transition-all duration-500 w-full"
									/>
								) : (
									<div
										className="bg-primary h-4 rounded-full transition-all duration-500"
										style={{
												width: `${((processedSteps.length / (LGSteps.length+4)) * 100)}%`,
										}}
									></div>
								)}
							</div>
						</div>
						{processedStatus.includes("error") 
						&& <Button variant={"destructive"} className="w-full rounded-2xl py-2" onClick={() => {
								setTrigger(false);
								setProcessedSteps([]);
								setProcessedStatus(["loading"]);
							}}>
							Kembali
						</Button>}
					</div>
				</div>
			</motion.div>
		</div>
	</AnimatePresence>);
}

function AnimatedCheckIcon({ initial = false, isVisible = false, fail = false }) {
  return (
    <div className="flex items-center">
			<AnimatePresence initial={initial}>
				{(isVisible || fail) && (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke={fail ? "var(--destructive)" : "var(--primary)"}
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
							d={
								fail
									? "M6 6l12 12M6 18L18 6" // Cross icon path
									: "M4.5 12.75l6 6 9-13.5" // Check icon path
							}
						/>
					</svg>
				)}
			</AnimatePresence>

			<AnimatePresence initial={initial}>
        {!isVisible && !fail && (
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