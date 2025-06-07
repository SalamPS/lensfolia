import { cn } from "@/lib/utils";
import { Spotlight } from "./ui/spotlight";

export default function DynamicBG ({fixed=false}: {fixed?: boolean}) {
	return <div className={`bg-background overflow-hidden z-0 flex flex-col h-fit w-full items-center justify-center ${fixed ? "fixed" : "absolute"}`}>
		<div className="bg-background flex h-[50rem] w-full items-center justify-center overflow-hidden">
			<Spotlight
				gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(180, 100%, 85%, 0.12) 0%, hsla(180, 100%, 55%, 0.08) 50%, hsla(180, 100%, 45%, 0) 80%)"
				gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(200, 100%, 85%, 0.1) 0%, hsla(200, 100%, 55%, 0.06) 80%, transparent 100%)"
				gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(150, 100%, 85%, 0.08) 0%, hsla(150, 100%, 45%, 0.04) 80%, transparent 100%)"
				translateY={-320}
				duration={8}
				xOffset={80}
			/>
			<div
				className={cn(
					"absolute inset-0",
					"[background-size:80px_80px]",
					"[background-image:linear-gradient(to_right,#d4d4d8_1px,transparent_1px),linear-gradient(to_bottom,#d4d4d8_1px,transparent_1px)]",
					"dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
				)}
			/>

			{/* Radial gradient for the container to give a faded look */}
			<div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-zinc-50 [mask-image:radial-gradient(ellipse_at_center,transparent_10%,white_80%)] dark:bg-zinc-900"></div>
		</div>
	</div>
}