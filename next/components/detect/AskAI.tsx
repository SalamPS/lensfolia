import { IconSend, IconSparkles } from "@tabler/icons-react";
import { LFDResult_ } from "../types/diagnoseResult";

const AIBubble = ({ text }: { text: string }) => {
	return (
		<div className="bg-secondary shadow-foreground/[0.1] hover:bg-secondary/80 m-1 inline-block cursor-pointer rounded-full p-2 px-3 text-xs shadow-inner transition-colors">
			{text}
		</div>
	);
};

export function AskAI ({disease}: {disease: LFDResult_ | null}) {
	return (
		<div id="ask-ai" className="border-border rounded-3xl border-[1px]">
			<h3 className="border-border flex items-center justify-center border-b-[1px] p-2 py-6 font-semibold">
				<IconSparkles className="mr-2 inline" size={24} />
				Konsultasi lebih lanjut dengan AI
			</h3>
			<div className="flex flex-col gap-4 px-6">
				<div className="flex h-80 grow flex-col items-center justify-center">
					<h4 className="mb-8 font-semibold">
						Apa yang bisa saya bantu?
					</h4>
					<div className="w-[80%] text-center">
						{disease?.ai_bubble?.length
							? disease.ai_bubble.map((text, index) => (
									<AIBubble key={index} text={text} />
								))
							: null}
					</div>
				</div>
				<div className="bg-secondary mt-2 flex rounded-t-2xl p-3 px-5">
					<input
						className="text-muted-foreground grow outline-none"
						type="text"
						placeholder="Tanyakan apapun terkait deteksi daunmu"
					/>
					<button className="bg-foreground text-background hover:bg-primary/10 rounded-full p-3 transition-colors">
						<IconSend />
					</button>
				</div>
			</div>
		</div>
	);
}